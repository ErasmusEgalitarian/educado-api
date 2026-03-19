jest.mock('../../../models', () => ({
  User: {
    findOne: jest.fn(),
  },
  PasswordReset: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
}))

jest.mock('../../../infrastructure/security/password-hasher', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}))

import { AppError } from '../../common/app-error'
import { User, PasswordReset } from '../../../models'
import {
  hashPassword,
  verifyPassword,
} from '../../../infrastructure/security/password-hasher'
import {
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPassword,
} from '../password-reset-service'

const mockUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  firstName: 'Test',
  email: 'test@example.com',
  emailNormalized: 'test@example.com',
  passwordHash: 'hashed-pw',
  update: jest.fn().mockResolvedValue(undefined),
  ...overrides,
})

describe('requestPasswordReset', () => {
  it('should return sent: true with code when user exists', async () => {
    const user = mockUser()
    ;(User.findOne as jest.Mock).mockResolvedValue(user)
    ;(PasswordReset.count as jest.Mock).mockResolvedValue(0)
    ;(PasswordReset.update as jest.Mock).mockResolvedValue([0])
    ;(hashPassword as jest.Mock).mockResolvedValue('hashed-code')
    ;(PasswordReset.create as jest.Mock).mockResolvedValue({})

    const result = await requestPasswordReset('test@example.com')
    expect(result.sent).toBe(true)
    expect(result.userId).toBe('user-1')
    expect(result.code).toBeDefined()
    expect(typeof result.code).toBe('string')
  })

  it('should return sent: true silently when user does not exist', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(null)

    const result = await requestPasswordReset('nobody@example.com')
    expect(result.sent).toBe(true)
    expect(result.userId).toBeUndefined()
    expect(result.code).toBeUndefined()
  })

  it('should throw RATE_LIMITED when too many requests', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.count as jest.Mock).mockResolvedValue(3)

    try {
      await requestPasswordReset('test@example.com')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(429)
      expect((e as AppError).payload.code).toBe('RATE_LIMITED')
    }
  })

  it('should expire pending resets before creating new one', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.count as jest.Mock).mockResolvedValue(0)
    ;(PasswordReset.update as jest.Mock).mockResolvedValue([1])
    ;(hashPassword as jest.Mock).mockResolvedValue('hashed-code')
    ;(PasswordReset.create as jest.Mock).mockResolvedValue({})

    await requestPasswordReset('test@example.com')
    expect(PasswordReset.update).toHaveBeenCalledWith(
      { status: 'EXPIRED' },
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1', status: 'PENDING' }),
      })
    )
  })
})

describe('verifyPasswordResetCode', () => {
  it('should return verified: true on correct code', async () => {
    const resetRecord = {
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 60000),
      codeHash: 'hashed',
      attempts: 0,
      maxAttempts: 5,
      update: jest.fn().mockResolvedValue(undefined),
    }
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue(resetRecord)
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)

    const result = await verifyPasswordResetCode('test@example.com', '1234')
    expect(result.verified).toBe(true)
    expect(resetRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'VERIFIED' })
    )
  })

  it('should increment attempts on wrong code', async () => {
    const resetRecord = {
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 60000),
      codeHash: 'hashed',
      attempts: 0,
      maxAttempts: 5,
      update: jest.fn().mockResolvedValue(undefined),
    }
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue(resetRecord)
    ;(verifyPassword as jest.Mock).mockResolvedValue(false)

    try {
      await verifyPasswordResetCode('test@example.com', 'wrong')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(422)
      expect(resetRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({ attempts: 1 })
      )
    }
  })

  it('should lock after max attempts', async () => {
    const resetRecord = {
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 60000),
      codeHash: 'hashed',
      attempts: 4,
      maxAttempts: 5,
      update: jest.fn().mockResolvedValue(undefined),
    }
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue(resetRecord)
    ;(verifyPassword as jest.Mock).mockResolvedValue(false)

    try {
      await verifyPasswordResetCode('test@example.com', 'wrong')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(423)
      expect((e as AppError).payload.code).toBe('RESET_LOCKED')
      expect(resetRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'LOCKED' })
      )
    }
  })

  it('should throw USER_NOT_FOUND if user does not exist', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(null)

    try {
      await verifyPasswordResetCode('nobody@example.com', '1234')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('USER_NOT_FOUND')
    }
  })

  it('should throw CODE_EXPIRED when no reset record exists', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue(null)

    try {
      await verifyPasswordResetCode('test@example.com', '1234')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(410)
      expect((e as AppError).payload.code).toBe('CODE_EXPIRED')
    }
  })

  it('should throw RESET_LOCKED when status is LOCKED', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue({
      status: 'LOCKED',
      update: jest.fn(),
    })

    try {
      await verifyPasswordResetCode('test@example.com', '1234')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(423)
      expect((e as AppError).payload.code).toBe('RESET_LOCKED')
    }
  })

  it('should throw CODE_EXPIRED when code has expired', async () => {
    const resetRecord = {
      status: 'PENDING',
      expiresAt: new Date(Date.now() - 60000),
      codeHash: 'hashed',
      attempts: 0,
      maxAttempts: 5,
      update: jest.fn().mockResolvedValue(undefined),
    }
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue(resetRecord)

    try {
      await verifyPasswordResetCode('test@example.com', '1234')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(410)
      expect(resetRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'EXPIRED' })
      )
    }
  })
})

describe('resetPassword', () => {
  it('should reset password successfully', async () => {
    const user = mockUser()
    const resetRecord = {
      status: 'VERIFIED',
      codeHash: 'hashed',
      update: jest.fn().mockResolvedValue(undefined),
    }
    ;(User.findOne as jest.Mock).mockResolvedValue(user)
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue(resetRecord)
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)
    ;(hashPassword as jest.Mock).mockResolvedValue('new-hashed-pw')

    const result = await resetPassword(
      'test@example.com',
      '1234',
      'NewPassword1'
    )
    expect(result.reset).toBe(true)
    expect(user.update).toHaveBeenCalledWith({ passwordHash: 'new-hashed-pw' })
    expect(resetRecord.update).toHaveBeenCalledWith({ status: 'EXPIRED' })
  })

  it('should throw VALIDATION_ERROR when password does not meet policy', async () => {
    const user = mockUser()
    const resetRecord = {
      status: 'VERIFIED',
      codeHash: 'hashed',
      update: jest.fn().mockResolvedValue(undefined),
    }
    ;(User.findOne as jest.Mock).mockResolvedValue(user)
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue(resetRecord)
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)

    try {
      await resetPassword('test@example.com', '1234', 'short')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(422)
      expect((e as AppError).payload.code).toBe('VALIDATION_ERROR')
    }
  })

  it('should throw CODE_EXPIRED when no verified reset record exists', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue(null)

    try {
      await resetPassword('test@example.com', '1234', 'NewPassword1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(410)
      expect((e as AppError).payload.code).toBe('CODE_EXPIRED')
    }
  })

  it('should throw VALIDATION_ERROR when code does not match', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(PasswordReset.findOne as jest.Mock).mockResolvedValue({
      status: 'VERIFIED',
      codeHash: 'hashed',
      update: jest.fn(),
    })
    ;(verifyPassword as jest.Mock).mockResolvedValue(false)

    try {
      await resetPassword('test@example.com', 'wrong', 'NewPassword1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(422)
    }
  })

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(null)

    try {
      await resetPassword('nobody@example.com', '1234', 'NewPassword1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('USER_NOT_FOUND')
    }
  })
})
