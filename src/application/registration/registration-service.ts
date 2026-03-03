import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { AppError } from '../common/app-error'
import {
  RegistrationProfileInput,
  normalizeEmail,
} from './registration-validation'
import { hashPassword, verifyPassword } from '../../infrastructure/security/password-hasher'
import {
  RegistrationStatus,
  ReviewDecision,
  UserRole,
} from '../../domain/registration/enums'
import {
  RegistrationProfile,
  RegistrationReview,
  User,
} from '../../models'
import { sequelize } from '../../config/database'
import { getAccessTokenSecret } from '../../config/jwt'

type RejectReviewInput = {
  reason: string
  notes?: string
}

const assertStatusTransition = (
  current: RegistrationStatus,
  allowed: RegistrationStatus[]
) => {
  if (!allowed.includes(current)) {
    throw new AppError(409, { code: 'INVALID_STATUS_TRANSITION' })
  }
}

export const registerUser = async (input: {
  firstName: string
  lastName: string
  email: string
  password: string
}) => {
  const emailNormalized = normalizeEmail(input.email)

  const existingUser = await User.findOne({
    where: {
      emailNormalized: {
        [Op.eq]: emailNormalized,
      },
    },
  })

  if (existingUser) {
    throw new AppError(409, { code: 'EMAIL_ALREADY_EXISTS' })
  }

  const passwordHash = await hashPassword(input.password)

  const user = await User.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.trim(),
    emailNormalized,
    passwordHash,
    status: 'DRAFT_PROFILE',
    role: 'USER',
  })

  return {
    userId: user.id,
    registrationStatus: user.status,
  }
}

export const submitRegistrationProfile = async (
  userId: string,
  profileInput: RegistrationProfileInput
) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError(404, { code: 'USER_NOT_FOUND' })
  }

  assertStatusTransition(user.status as RegistrationStatus, [
    'DRAFT_PROFILE',
    'REJECTED',
  ])

  const existingProfile = await RegistrationProfile.findOne({ where: { userId } })

  if (existingProfile) {
    await existingProfile.update(profileInput)
  } else {
    await RegistrationProfile.create({
      userId,
      ...profileInput,
    })
  }

  await user.update({ status: 'PENDING_REVIEW' })

  return {
    registrationStatus: user.status,
  }
}

export const getRegistrationStatus = async (userId: string) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError(404, { code: 'USER_NOT_FOUND' })
  }

  const latestReview = await RegistrationReview.findOne({
    where: { userId },
    order: [['createdAt', 'DESC']],
  })

  return {
    status: user.status,
    reason: latestReview?.reason ?? undefined,
  }
}

export const login = async (input: { email: string; password: string }) => {
  const emailNormalized = normalizeEmail(input.email)
  const user = await User.findOne({ where: { emailNormalized } })

  if (!user) {
    throw new AppError(401, { code: 'INVALID_CREDENTIALS' })
  }

  let passwordMatches = false
  try {
    passwordMatches = await verifyPassword(input.password, user.passwordHash)
  } catch {
    throw new AppError(500, { code: 'INVALID_PASSWORD_HASH_FORMAT' })
  }

  if (!passwordMatches) {
    throw new AppError(401, { code: 'INVALID_CREDENTIALS' })
  }

  if (user.status !== 'APPROVED') {
    throw new AppError(403, { code: 'ACCOUNT_NOT_APPROVED' })
  }

  const secret = getAccessTokenSecret()

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    secret,
    { expiresIn: '12h' }
  )

  await user.update({ lastLoginAt: new Date() })

  return {
    accessToken: token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  }
}

export const listRegistrationsForAdmin = async (status?: RegistrationStatus) => {
  const whereClause = status ? { status } : undefined

  const users = await User.findAll({
    where: whereClause,
    include: [
      {
        model: RegistrationProfile,
        as: 'registrationProfile',
      },
    ],
    order: [['createdAt', 'ASC']],
  })

  return users.map((user) => {
    const profile = user.get('registrationProfile') as RegistrationProfile | undefined
    return {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
      profileSummary: profile
        ? {
            motivations: profile.motivations.slice(0, 240),
            academicBackground: profile.academicBackground.slice(0, 240),
            professionalExperience: profile.professionalExperience.slice(0, 240),
          }
        : null,
    }
  })
}

const reviewRegistration = async (
  userId: string,
  reviewedBy: string,
  decision: ReviewDecision,
  reason?: string,
  notes?: string
) => {
  return sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, { transaction })

    if (!user) {
      throw new AppError(404, { code: 'USER_NOT_FOUND' })
    }

    assertStatusTransition(user.status as RegistrationStatus, ['PENDING_REVIEW'])

    const nextStatus: RegistrationStatus =
      decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'

    await user.update({ status: nextStatus }, { transaction })

    await RegistrationReview.create(
      {
        userId,
        reviewedBy,
        decision,
        reason: reason ?? null,
        notes: notes ?? null,
      },
      { transaction }
    )

    return {
      registrationStatus: user.status,
    }
  })
}

export const approveRegistration = async (userId: string, reviewedBy: string) => {
  return reviewRegistration(userId, reviewedBy, 'APPROVE')
}

export const rejectRegistration = async (
  userId: string,
  reviewedBy: string,
  payload: RejectReviewInput
) => {
  return reviewRegistration(
    userId,
    reviewedBy,
    'REJECT',
    payload.reason,
    payload.notes
  )
}

export const ensureAdminRole = (role: UserRole) => {
  if (role !== 'ADMIN') {
    throw new AppError(403, { code: 'FORBIDDEN' })
  }
}
