jest.mock('../../../models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  EmailVerification: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    sequelize: {
      transaction: jest.fn((fn: (t: unknown) => Promise<unknown>) => fn({})),
    },
  },
  Institution: {
    findOne: jest.fn(),
  },
  RegistrationReview: {
    create: jest.fn(),
  },
}))

jest.mock('../../../infrastructure/security/password-hasher', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-code'),
  verifyPassword: jest.fn(),
}))

import { AppError } from '../../common/app-error'
import {
  User,
  EmailVerification,
  Institution,
  RegistrationReview,
} from '../../../models'
import {
  hashPassword,
  verifyPassword,
} from '../../../infrastructure/security/password-hasher'
import {
  extractDomainFromEmail,
  isTrustedDomain,
  createEmailVerification,
  sendEmailVerificationCode,
  confirmEmailVerification,
} from '../email-verification-service'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('extractDomainFromEmail', () => {
  it('should extract domain from a valid email', () => {
    expect(extractDomainFromEmail('user@example.com')).toBe('example.com')
  })

  it('should return empty string when no @ present', () => {
    expect(extractDomainFromEmail('nodomain')).toBe('')
  })

  it('should normalize domain to lowercase', () => {
    expect(extractDomainFromEmail('user@EXAMPLE.COM')).toBe('example.com')
  })

  it('should handle email with empty domain part', () => {
    // 'user@@example.com'.split('@') = ['user', '', 'example.com']
    // The second element (index 1) is '', so normalizeDomain returns ''
    expect(extractDomainFromEmail('user@@example.com')).toBe('')
  })
})

describe('isTrustedDomain', () => {
  it('should return true when institution exists with matching domain', async () => {
    ;(Institution.findOne as jest.Mock).mockResolvedValue({ id: 'inst-1' })

    const result = await isTrustedDomain('university.edu')

    expect(result).toBe(true)
    expect(Institution.findOne).toHaveBeenCalled()
  })

  it('should return false when no institution matches', async () => {
    ;(Institution.findOne as jest.Mock).mockResolvedValue(null)

    const result = await isTrustedDomain('gmail.com')

    expect(result).toBe(false)
  })

  it('should return false for empty domain', async () => {
    const result = await isTrustedDomain('')

    expect(result).toBe(false)
    expect(Institution.findOne).not.toHaveBeenCalled()
  })

  it('should normalize domain before checking', async () => {
    ;(Institution.findOne as jest.Mock).mockResolvedValue(null)

    await isTrustedDomain('  @EXAMPLE.COM  ')

    expect(Institution.findOne).toHaveBeenCalled()
  })
})

describe('createEmailVerification', () => {
  it('should generate OTP, hash it, expire old verifications, and create new one', async () => {
    ;(EmailVerification.update as jest.Mock).mockResolvedValue([1])
    ;(EmailVerification.create as jest.Mock).mockResolvedValue({})

    const result = await createEmailVerification('user-1')

    expect(result.code).toMatch(/^\d{6}$/)
    expect(result.expiresAt).toBeInstanceOf(Date)
    expect(hashPassword).toHaveBeenCalledWith(result.code)
    expect(EmailVerification.update).toHaveBeenCalledWith(
      { status: 'EXPIRED' },
      expect.objectContaining({
        where: { userId: 'user-1', status: 'PENDING' },
      })
    )
    expect(EmailVerification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        codeHash: 'hashed-code',
        status: 'PENDING',
        attempts: 0,
        maxAttempts: 5,
      }),
      expect.anything()
    )
  })
})

describe('sendEmailVerificationCode', () => {
  it('should return email, firstName, and code when user is PENDING_EMAIL_VERIFICATION', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'test@uni.edu',
      firstName: 'Test',
      status: 'PENDING_EMAIL_VERIFICATION',
    })
    ;(EmailVerification.count as jest.Mock).mockResolvedValue(0)
    ;(EmailVerification.update as jest.Mock).mockResolvedValue([1])
    ;(EmailVerification.create as jest.Mock).mockResolvedValue({})

    const result = await sendEmailVerificationCode('user-1')

    expect(result.email).toBe('test@uni.edu')
    expect(result.firstName).toBe('Test')
    expect(result.code).toMatch(/^\d{6}$/)
  })

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    await expect(sendEmailVerificationCode('nonexistent')).rejects.toThrow(
      AppError
    )

    try {
      await sendEmailVerificationCode('nonexistent')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('USER_NOT_FOUND')
    }
  })

  it('should throw VERIFICATION_NOT_ALLOWED_FOR_STATUS for wrong status', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue({
      id: 'user-1',
      status: 'APPROVED',
    })

    await expect(sendEmailVerificationCode('user-1')).rejects.toThrow(AppError)

    try {
      await sendEmailVerificationCode('user-1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(409)
      expect((e as AppError).payload.code).toBe(
        'VERIFICATION_NOT_ALLOWED_FOR_STATUS'
      )
    }
  })

  it('should throw RATE_LIMITED when too many codes sent', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue({
      id: 'user-1',
      status: 'PENDING_EMAIL_VERIFICATION',
    })
    ;(EmailVerification.count as jest.Mock).mockResolvedValue(3)

    await expect(sendEmailVerificationCode('user-1')).rejects.toThrow(AppError)

    try {
      await sendEmailVerificationCode('user-1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(429)
      expect((e as AppError).payload.code).toBe('RATE_LIMITED')
    }
  })
})

describe('confirmEmailVerification', () => {
  const mockVerification = (overrides: Record<string, unknown> = {}) => ({
    id: 'ver-1',
    userId: 'user-1',
    codeHash: 'hashed-code',
    status: 'PENDING',
    attempts: 0,
    maxAttempts: 5,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  })

  const mockUserObj = (overrides: Record<string, unknown> = {}) => ({
    id: 'user-1',
    email: 'test@uni.edu',
    emailNormalized: 'test@uni.edu',
    firstName: 'Test',
    status: 'PENDING_EMAIL_VERIFICATION',
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  })

  it('should verify code and approve user on correct code', async () => {
    const user = mockUserObj()
    const verification = mockVerification()
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)
    ;(EmailVerification.findOne as jest.Mock).mockResolvedValue(verification)
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)
    ;(User.findOne as jest.Mock).mockResolvedValue({ id: 'system-reviewer' })
    ;(RegistrationReview.create as jest.Mock).mockResolvedValue({})

    const result = await confirmEmailVerification('user-1', '123456')

    expect(verification.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'VERIFIED' }),
      expect.anything()
    )
    expect(user.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'APPROVED' }),
      expect.anything()
    )
    expect(RegistrationReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        decision: 'APPROVE',
        reason: 'AUTO_EMAIL_DOMAIN_VERIFIED',
      }),
      expect.anything()
    )
    expect(result.status).toBeDefined()
  })

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    await expect(
      confirmEmailVerification('nonexistent', '123456')
    ).rejects.toThrow(AppError)

    try {
      await confirmEmailVerification('nonexistent', '123456')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('USER_NOT_FOUND')
    }
  })

  it('should throw VERIFICATION_NOT_ALLOWED_FOR_STATUS for wrong status', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(
      mockUserObj({ status: 'APPROVED' })
    )

    await expect(confirmEmailVerification('user-1', '123456')).rejects.toThrow(
      AppError
    )

    try {
      await confirmEmailVerification('user-1', '123456')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(409)
      expect((e as AppError).payload.code).toBe(
        'VERIFICATION_NOT_ALLOWED_FOR_STATUS'
      )
    }
  })

  it('should throw CODE_EXPIRED when no verification exists', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUserObj())
    ;(EmailVerification.findOne as jest.Mock).mockResolvedValue(null)

    await expect(confirmEmailVerification('user-1', '123456')).rejects.toThrow(
      AppError
    )

    try {
      await confirmEmailVerification('user-1', '123456')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(410)
      expect((e as AppError).payload.code).toBe('CODE_EXPIRED')
    }
  })

  it('should throw VERIFICATION_LOCKED when verification is locked', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUserObj())
    ;(EmailVerification.findOne as jest.Mock).mockResolvedValue(
      mockVerification({ status: 'LOCKED' })
    )

    await expect(confirmEmailVerification('user-1', '123456')).rejects.toThrow(
      AppError
    )

    try {
      await confirmEmailVerification('user-1', '123456')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(423)
      expect((e as AppError).payload.code).toBe('VERIFICATION_LOCKED')
    }
  })

  it('should throw CODE_EXPIRED when verification status is not PENDING', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUserObj())
    ;(EmailVerification.findOne as jest.Mock).mockResolvedValue(
      mockVerification({ status: 'EXPIRED' })
    )

    await expect(confirmEmailVerification('user-1', '123456')).rejects.toThrow(
      AppError
    )

    try {
      await confirmEmailVerification('user-1', '123456')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(410)
      expect((e as AppError).payload.code).toBe('CODE_EXPIRED')
    }
  })

  it('should throw CODE_EXPIRED when verification has expired by time', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUserObj())
    ;(EmailVerification.findOne as jest.Mock).mockResolvedValue(
      mockVerification({
        expiresAt: new Date(Date.now() - 1000),
      })
    )

    await expect(confirmEmailVerification('user-1', '123456')).rejects.toThrow(
      AppError
    )

    try {
      await confirmEmailVerification('user-1', '123456')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(410)
      expect((e as AppError).payload.code).toBe('CODE_EXPIRED')
    }
  })

  it('should throw VALIDATION_ERROR with INVALID_CODE on wrong code (not locked)', async () => {
    const verification = mockVerification({ attempts: 0, maxAttempts: 5 })
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUserObj())
    ;(EmailVerification.findOne as jest.Mock).mockResolvedValue(verification)
    ;(verifyPassword as jest.Mock).mockResolvedValue(false)

    await expect(confirmEmailVerification('user-1', '000000')).rejects.toThrow(
      AppError
    )

    try {
      await confirmEmailVerification('user-1', '000000')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(422)
      expect((e as AppError).payload.code).toBe('VALIDATION_ERROR')
      expect((e as AppError).payload.fieldErrors.code).toBe('INVALID_CODE')
    }
  })

  it('should lock verification and move user to PENDING_REVIEW after max attempts', async () => {
    const user = mockUserObj()
    const verification = mockVerification({ attempts: 4, maxAttempts: 5 })
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)
    ;(EmailVerification.findOne as jest.Mock).mockResolvedValue(verification)
    ;(verifyPassword as jest.Mock).mockResolvedValue(false)

    await expect(confirmEmailVerification('user-1', '000000')).rejects.toThrow(
      AppError
    )

    expect(verification.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'LOCKED', attempts: 5 }),
      expect.anything()
    )
    expect(user.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDING_REVIEW' }),
      expect.anything()
    )

    try {
      // Re-mock for second call
      const user2 = mockUserObj()
      const verification2 = mockVerification({ attempts: 4, maxAttempts: 5 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user2)
      ;(EmailVerification.findOne as jest.Mock).mockResolvedValue(verification2)
      ;(verifyPassword as jest.Mock).mockResolvedValue(false)
      await confirmEmailVerification('user-1', '000000')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(423)
      expect((e as AppError).payload.code).toBe('VERIFICATION_LOCKED')
    }
  })

  it('should create system reviewer user if not found', async () => {
    const user = mockUserObj()
    const verification = mockVerification()
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)
    ;(EmailVerification.findOne as jest.Mock).mockResolvedValue(verification)
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)
    ;(User.findOne as jest.Mock).mockResolvedValue(null)
    ;(hashPassword as jest.Mock).mockResolvedValue('system-hash')
    ;(User.create as jest.Mock).mockResolvedValue({ id: 'new-system-reviewer' })
    ;(RegistrationReview.create as jest.Mock).mockResolvedValue({})

    const result = await confirmEmailVerification('user-1', '123456')

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'System',
        lastName: 'Reviewer',
        role: 'ADMIN',
        status: 'APPROVED',
      }),
      expect.anything()
    )
    expect(result.status).toBeDefined()
  })
})
