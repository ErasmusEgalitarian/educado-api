jest.mock('../../../models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
  RegistrationProfile: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  RegistrationReview: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  EmailVerification: {
    destroy: jest.fn(),
  },
}))

jest.mock('../../../infrastructure/security/password-hasher', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}))

jest.mock('../../../infrastructure/email/email-factory', () => ({
  createEmailService: () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
  }),
}))

jest.mock('../../verification/email-verification-service', () => ({
  createEmailVerification: jest.fn(),
  extractDomainFromEmail: jest.fn(),
  isTrustedDomain: jest.fn(),
}))

jest.mock('../../../config/database', () => ({
  sequelize: {
    transaction: jest.fn((fn: (t: unknown) => Promise<unknown>) => fn({})),
  },
}))

jest.mock('../../../config/jwt', () => ({
  getAccessTokenSecret: jest.fn(() => 'test-secret'),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
}))

import { AppError } from '../../common/app-error'
import {
  User,
  RegistrationProfile,
  RegistrationReview,
  EmailVerification,
} from '../../../models'
import { hashPassword, verifyPassword } from '../../../infrastructure/security/password-hasher'
import {
  createEmailVerification,
  extractDomainFromEmail,
  isTrustedDomain,
} from '../../verification/email-verification-service'
import {
  registerUser,
  login,
  getRegistrationStatus,
  submitRegistrationProfile,
  deleteOwnAccount,
  ensureAdminRole,
  listRegistrationsForAdmin,
  listUsersForAdmin,
  toggleUserRoleByAdmin,
  deleteUserByAdmin,
  getUserByIdForAdmin,
  approveRegistration,
  rejectRegistration,
} from '../registration-service'

const mockUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  emailNormalized: 'test@example.com',
  passwordHash: 'hashed-pw',
  status: 'APPROVED',
  role: 'USER',
  avatarMediaId: null,
  lastLoginAt: null,
  createdAt: new Date(),
  update: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  get: jest.fn(),
  ...overrides,
})

describe('registerUser', () => {
  it('should create a new user and return userId and status', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(null)
    ;(hashPassword as jest.Mock).mockResolvedValue('hashed-password')
    ;(User.create as jest.Mock).mockResolvedValue({
      id: 'new-user-id',
      status: 'DRAFT_PROFILE',
    })

    const result = await registerUser({
      firstName: 'Ana',
      lastName: 'Silva',
      email: 'ana@example.com',
      password: 'Password1',
    })

    expect(result.userId).toBe('new-user-id')
    expect(result.registrationStatus).toBe('DRAFT_PROFILE')
    expect(hashPassword).toHaveBeenCalledWith('Password1')
  })

  it('should throw EMAIL_ALREADY_EXISTS if email is taken', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())

    await expect(
      registerUser({
        firstName: 'Ana',
        lastName: 'Silva',
        email: 'test@example.com',
        password: 'Password1',
      })
    ).rejects.toThrow(AppError)

    try {
      await registerUser({
        firstName: 'Ana',
        lastName: 'Silva',
        email: 'test@example.com',
        password: 'Password1',
      })
    } catch (e) {
      expect((e as AppError).statusCode).toBe(409)
      expect((e as AppError).payload.code).toBe('EMAIL_ALREADY_EXISTS')
    }
  })
})

describe('login', () => {
  it('should return accessToken and user on valid credentials', async () => {
    const user = mockUser()
    ;(User.findOne as jest.Mock).mockResolvedValue(user)
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)

    const result = await login({ email: 'test@example.com', password: 'Password1' })

    expect(result.accessToken).toBe('mock-token')
    expect(result.user.id).toBe('user-1')
    expect(result.user.email).toBe('test@example.com')
    expect(user.update).toHaveBeenCalled()
  })

  it('should throw INVALID_CREDENTIALS when user not found', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(null)

    await expect(
      login({ email: 'none@example.com', password: 'Password1' })
    ).rejects.toThrow(AppError)

    try {
      await login({ email: 'none@example.com', password: 'Password1' })
    } catch (e) {
      expect((e as AppError).statusCode).toBe(401)
      expect((e as AppError).payload.code).toBe('INVALID_CREDENTIALS')
    }
  })

  it('should throw INVALID_CREDENTIALS when password does not match', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(verifyPassword as jest.Mock).mockResolvedValue(false)

    try {
      await login({ email: 'test@example.com', password: 'wrong' })
    } catch (e) {
      expect((e as AppError).statusCode).toBe(401)
      expect((e as AppError).payload.code).toBe('INVALID_CREDENTIALS')
    }
  })

  it('should throw ACCOUNT_NOT_APPROVED when status is not APPROVED', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser({ status: 'PENDING_REVIEW' }))
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)

    try {
      await login({ email: 'test@example.com', password: 'Password1' })
    } catch (e) {
      expect((e as AppError).statusCode).toBe(403)
      expect((e as AppError).payload.code).toBe('ACCOUNT_NOT_APPROVED')
    }
  })

  it('should throw REGISTRATION_PENDING_EMAIL_VERIFICATION for that status', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(
      mockUser({ status: 'PENDING_EMAIL_VERIFICATION' })
    )
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)

    try {
      await login({ email: 'test@example.com', password: 'Password1' })
    } catch (e) {
      expect((e as AppError).statusCode).toBe(403)
      expect((e as AppError).payload.code).toBe('REGISTRATION_PENDING_EMAIL_VERIFICATION')
    }
  })

  it('should throw INVALID_PASSWORD_HASH_FORMAT when verifyPassword throws', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser())
    ;(verifyPassword as jest.Mock).mockRejectedValue(new Error('bad hash'))

    try {
      await login({ email: 'test@example.com', password: 'Password1' })
    } catch (e) {
      expect((e as AppError).statusCode).toBe(500)
      expect((e as AppError).payload.code).toBe('INVALID_PASSWORD_HASH_FORMAT')
    }
  })
})

describe('getRegistrationStatus', () => {
  it('should return status and reason', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUser({ status: 'REJECTED' }))
    ;(RegistrationReview.findOne as jest.Mock).mockResolvedValue({
      reason: 'Incomplete profile',
    })

    const result = await getRegistrationStatus('user-1')
    expect(result.status).toBe('REJECTED')
    expect(result.reason).toBe('Incomplete profile')
  })

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    try {
      await getRegistrationStatus('nonexistent')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('USER_NOT_FOUND')
    }
  })

  it('should return undefined reason when no review exists', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUser())
    ;(RegistrationReview.findOne as jest.Mock).mockResolvedValue(null)

    const result = await getRegistrationStatus('user-1')
    expect(result.reason).toBeUndefined()
  })
})

describe('submitRegistrationProfile', () => {
  it('should create a profile and go to PENDING_REVIEW for untrusted domain', async () => {
    const user = mockUser({ status: 'DRAFT_PROFILE' })
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)
    ;(RegistrationProfile.findOne as jest.Mock).mockResolvedValue(null)
    ;(RegistrationProfile.create as jest.Mock).mockResolvedValue({})
    ;(extractDomainFromEmail as jest.Mock).mockReturnValue('gmail.com')
    ;(isTrustedDomain as jest.Mock).mockResolvedValue(false)

    const result = await submitRegistrationProfile('user-1', {
      motivations: 'test motivations',
      academicBackground: 'test background',
      professionalExperience: 'test experience',
    })

    expect(user.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDING_REVIEW' }),
      expect.anything()
    )
    expect(result.registrationStatus).toBeDefined()
  })

  it('should update existing profile and go to PENDING_EMAIL_VERIFICATION for trusted domain', async () => {
    const existingProfile = { update: jest.fn().mockResolvedValue(undefined) }
    const user = mockUser({ status: 'DRAFT_PROFILE' })
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)
    ;(RegistrationProfile.findOne as jest.Mock).mockResolvedValue(existingProfile)
    ;(extractDomainFromEmail as jest.Mock).mockReturnValue('university.edu')
    ;(isTrustedDomain as jest.Mock).mockResolvedValue(true)
    ;(createEmailVerification as jest.Mock).mockResolvedValue({ code: '1234' })

    const result = await submitRegistrationProfile('user-1', {
      motivations: 'test motivations',
      academicBackground: 'test background',
      professionalExperience: 'test experience',
    })

    expect(existingProfile.update).toHaveBeenCalled()
    expect(result.nextAction).toBe('CONFIRM_EMAIL_CODE')
  })

  it('should throw USER_NOT_FOUND if user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    await expect(
      submitRegistrationProfile('nonexistent', {
        motivations: 'test',
        academicBackground: 'test',
        professionalExperience: 'test',
      })
    ).rejects.toThrow(AppError)
  })

  it('should throw INVALID_STATUS_TRANSITION for wrong status', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUser({ status: 'APPROVED' }))

    try {
      await submitRegistrationProfile('user-1', {
        motivations: 'test',
        academicBackground: 'test',
        professionalExperience: 'test',
      })
    } catch (e) {
      expect((e as AppError).statusCode).toBe(409)
      expect((e as AppError).payload.code).toBe('INVALID_STATUS_TRANSITION')
    }
  })
})

describe('deleteOwnAccount', () => {
  it('should delete user and related records', async () => {
    const user = mockUser()
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)
    ;(RegistrationReview.destroy as jest.Mock).mockResolvedValue(undefined)
    ;(RegistrationProfile.destroy as jest.Mock).mockResolvedValue(undefined)
    ;(EmailVerification.destroy as jest.Mock).mockResolvedValue(undefined)

    const result = await deleteOwnAccount('user-1')
    expect(result.deleted).toBe(true)
    expect(user.destroy).toHaveBeenCalled()
    expect(RegistrationReview.destroy).toHaveBeenCalled()
    expect(RegistrationProfile.destroy).toHaveBeenCalled()
    expect(EmailVerification.destroy).toHaveBeenCalled()
  })

  it('should throw USER_NOT_FOUND if user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    try {
      await deleteOwnAccount('nonexistent')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('USER_NOT_FOUND')
    }
  })
})

describe('ensureAdminRole', () => {
  it('should not throw for ADMIN role', () => {
    expect(() => ensureAdminRole('ADMIN')).not.toThrow()
  })

  it('should throw FORBIDDEN for USER role', () => {
    try {
      ensureAdminRole('USER')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(403)
      expect((e as AppError).payload.code).toBe('FORBIDDEN')
    }
  })

  it('should throw AppError for non-admin role', () => {
    expect(() => ensureAdminRole('USER')).toThrow(AppError)
  })
})

describe('listRegistrationsForAdmin', () => {
  it('should list users with profiles ordered by createdAt', async () => {
    const profile = {
      motivations: 'My motivations text',
      academicBackground: 'My academic background',
      professionalExperience: 'My professional experience',
    }
    const user = mockUser({
      status: 'PENDING_REVIEW',
      get: jest.fn(() => profile),
    })
    ;(User.findAll as jest.Mock).mockResolvedValue([user])

    const result = await listRegistrationsForAdmin()

    expect(User.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        order: [['createdAt', 'ASC']],
      })
    )
    expect(result).toHaveLength(1)
    expect(result[0].userId).toBe('user-1')
    expect(result[0].profileSummary).not.toBeNull()
    expect(result[0].profileSummary!.motivations).toBe('My motivations text')
  })

  it('should filter by status when provided', async () => {
    ;(User.findAll as jest.Mock).mockResolvedValue([])

    await listRegistrationsForAdmin('PENDING_REVIEW' as any)

    expect(User.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PENDING_REVIEW' },
      })
    )
  })

  it('should return null profileSummary when no profile exists', async () => {
    const user = mockUser({
      get: jest.fn(() => undefined),
    })
    ;(User.findAll as jest.Mock).mockResolvedValue([user])

    const result = await listRegistrationsForAdmin()

    expect(result[0].profileSummary).toBeNull()
  })
})

describe('listUsersForAdmin', () => {
  it('should list all users with approved dates', async () => {
    const profile = { updatedAt: new Date('2024-01-15') }
    const user = mockUser({
      get: jest.fn(() => profile),
    })
    ;(User.findAll as jest.Mock).mockResolvedValue([user])
    ;(RegistrationReview.findAll as jest.Mock).mockResolvedValue([
      { userId: 'user-1', createdAt: new Date('2024-01-20') },
    ])

    const result = await listUsersForAdmin()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('user-1')
    expect(result[0].registrationSubmittedAt).toEqual(new Date('2024-01-15'))
    expect(result[0].registrationApprovedAt).toEqual(new Date('2024-01-20'))
  })

  it('should return null dates when no profile or review exists', async () => {
    const user = mockUser({
      get: jest.fn(() => undefined),
    })
    ;(User.findAll as jest.Mock).mockResolvedValue([user])
    ;(RegistrationReview.findAll as jest.Mock).mockResolvedValue([])

    const result = await listUsersForAdmin()

    expect(result[0].registrationSubmittedAt).toBeNull()
    expect(result[0].registrationApprovedAt).toBeNull()
  })

  it('should skip review query when no users exist', async () => {
    ;(User.findAll as jest.Mock).mockResolvedValue([])

    const result = await listUsersForAdmin()

    expect(result).toHaveLength(0)
    expect(RegistrationReview.findAll).not.toHaveBeenCalled()
  })
})

describe('toggleUserRoleByAdmin', () => {
  it('should toggle USER to ADMIN', async () => {
    const user = mockUser({ role: 'USER' })
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)

    const result = await toggleUserRoleByAdmin('user-1', 'admin-1')

    expect(user.update).toHaveBeenCalledWith({ role: 'ADMIN' })
    expect(result.id).toBe('user-1')
  })

  it('should toggle ADMIN to USER', async () => {
    const user = mockUser({ role: 'ADMIN' })
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)

    const result = await toggleUserRoleByAdmin('user-1', 'admin-1')

    expect(user.update).toHaveBeenCalledWith({ role: 'USER' })
    expect(result.id).toBe('user-1')
  })

  it('should throw SELF_ROLE_CHANGE_NOT_ALLOWED when toggling self', async () => {
    await expect(
      toggleUserRoleByAdmin('admin-1', 'admin-1')
    ).rejects.toThrow(AppError)

    try {
      await toggleUserRoleByAdmin('admin-1', 'admin-1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(409)
      expect((e as AppError).payload.code).toBe('SELF_ROLE_CHANGE_NOT_ALLOWED')
    }
  })

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    await expect(
      toggleUserRoleByAdmin('nonexistent', 'admin-1')
    ).rejects.toThrow(AppError)

    try {
      await toggleUserRoleByAdmin('nonexistent', 'admin-1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('USER_NOT_FOUND')
    }
  })
})

describe('deleteUserByAdmin', () => {
  it('should delete user and all related records', async () => {
    const user = mockUser()
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)
    ;(RegistrationReview.destroy as jest.Mock).mockResolvedValue(undefined)
    ;(RegistrationProfile.destroy as jest.Mock).mockResolvedValue(undefined)
    ;(EmailVerification.destroy as jest.Mock).mockResolvedValue(undefined)

    const result = await deleteUserByAdmin('user-1', 'admin-1')

    expect(result.deleted).toBe(true)
    expect(user.destroy).toHaveBeenCalled()
    expect(RegistrationReview.destroy).toHaveBeenCalled()
    expect(RegistrationProfile.destroy).toHaveBeenCalled()
    expect(EmailVerification.destroy).toHaveBeenCalled()
  })

  it('should throw SELF_DELETE_NOT_ALLOWED when deleting self', async () => {
    await expect(
      deleteUserByAdmin('admin-1', 'admin-1')
    ).rejects.toThrow(AppError)

    try {
      await deleteUserByAdmin('admin-1', 'admin-1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(409)
      expect((e as AppError).payload.code).toBe('SELF_DELETE_NOT_ALLOWED')
    }
  })

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    await expect(
      deleteUserByAdmin('nonexistent', 'admin-1')
    ).rejects.toThrow(AppError)

    try {
      await deleteUserByAdmin('nonexistent', 'admin-1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('USER_NOT_FOUND')
    }
  })
})

describe('getUserByIdForAdmin', () => {
  it('should return user with profile for review', async () => {
    const profile = {
      motivations: 'My motivations',
      academicBackground: 'My background',
      professionalExperience: 'My experience',
    }
    const user = mockUser({
      get: jest.fn(() => profile),
    })
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)

    const result = await getUserByIdForAdmin('user-1')

    expect(result.id).toBe('user-1')
    expect(result.name).toBe('Test User')
    expect(result.motivations).toBe('My motivations')
    expect(result.academicBackground).toBe('My background')
    expect(result.professionalExperience).toBe('My experience')
  })

  it('should return null fields when no profile exists', async () => {
    const user = mockUser({
      get: jest.fn(() => undefined),
    })
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)

    const result = await getUserByIdForAdmin('user-1')

    expect(result.motivations).toBeNull()
    expect(result.academicBackground).toBeNull()
    expect(result.professionalExperience).toBeNull()
  })

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    await expect(getUserByIdForAdmin('nonexistent')).rejects.toThrow(AppError)

    try {
      await getUserByIdForAdmin('nonexistent')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('USER_NOT_FOUND')
    }
  })
})

describe('approveRegistration', () => {
  it('should approve user and send email', async () => {
    const user = mockUser({ status: 'PENDING_REVIEW' })
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)
    ;(RegistrationReview.create as jest.Mock).mockResolvedValue({})

    const result = await approveRegistration('user-1', 'admin-1')

    expect(user.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'APPROVED' }),
      expect.anything()
    )
    expect(RegistrationReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        reviewedBy: 'admin-1',
        decision: 'APPROVE',
      }),
      expect.anything()
    )
    expect(result.registrationStatus).toBeDefined()
  })

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    await expect(
      approveRegistration('nonexistent', 'admin-1')
    ).rejects.toThrow(AppError)
  })

  it('should throw INVALID_STATUS_TRANSITION for wrong status', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUser({ status: 'DRAFT_PROFILE' }))

    await expect(
      approveRegistration('user-1', 'admin-1')
    ).rejects.toThrow(AppError)

    try {
      await approveRegistration('user-1', 'admin-1')
    } catch (e) {
      expect((e as AppError).statusCode).toBe(409)
      expect((e as AppError).payload.code).toBe('INVALID_STATUS_TRANSITION')
    }
  })
})

describe('rejectRegistration', () => {
  it('should reject user with reason and notes', async () => {
    const user = mockUser({ status: 'PENDING_REVIEW' })
    ;(User.findByPk as jest.Mock).mockResolvedValue(user)
    ;(RegistrationReview.create as jest.Mock).mockResolvedValue({})

    const result = await rejectRegistration('user-1', 'admin-1', {
      reason: 'Incomplete profile',
      notes: 'Missing academic background',
    })

    expect(user.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'REJECTED' }),
      expect.anything()
    )
    expect(RegistrationReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        reviewedBy: 'admin-1',
        decision: 'REJECT',
        reason: 'Incomplete profile',
        notes: 'Missing academic background',
      }),
      expect.anything()
    )
    expect(result.registrationStatus).toBeDefined()
  })

  it('should throw USER_NOT_FOUND when user does not exist', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    await expect(
      rejectRegistration('nonexistent', 'admin-1', { reason: 'test' })
    ).rejects.toThrow(AppError)
  })

  it('should throw INVALID_STATUS_TRANSITION for wrong status', async () => {
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUser({ status: 'APPROVED' }))

    await expect(
      rejectRegistration('user-1', 'admin-1', { reason: 'test' })
    ).rejects.toThrow(AppError)

    try {
      await rejectRegistration('user-1', 'admin-1', { reason: 'test' })
    } catch (e) {
      expect((e as AppError).statusCode).toBe(409)
      expect((e as AppError).payload.code).toBe('INVALID_STATUS_TRANSITION')
    }
  })
})
