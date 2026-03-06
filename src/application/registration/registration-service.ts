import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { AppError } from '../common/app-error'
import {
  RegistrationProfileInput,
  normalizeEmail,
} from './registration-validation'
import {
  hashPassword,
  verifyPassword,
} from '../../infrastructure/security/password-hasher'
import { createEmailService } from '../../infrastructure/email/email-factory'
import {
  RegistrationStatus,
  ReviewDecision,
  UserRole,
} from '../../domain/registration/enums'
import { emailVerificationCodeTemplate } from '../email/templates/email-verification-code'
import { registrationApprovedTemplate } from '../email/templates/registration-approved'
import {
  createEmailVerification,
  extractDomainFromEmail,
  isTrustedDomain,
} from '../verification/email-verification-service'
import {
  EmailVerification,
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

const emailService = createEmailService()

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
  const result = await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, { transaction })

    if (!user) {
      throw new AppError(404, { code: 'USER_NOT_FOUND' })
    }

    assertStatusTransition(user.status as RegistrationStatus, [
      'DRAFT_PROFILE',
      'REJECTED',
    ])

    const existingProfile = await RegistrationProfile.findOne({
      where: { userId },
      transaction,
    })

    if (existingProfile) {
      await existingProfile.update(profileInput, { transaction })
    } else {
      await RegistrationProfile.create(
        {
          userId,
          ...profileInput,
        },
        { transaction }
      )
    }

    const emailDomain = extractDomainFromEmail(user.emailNormalized)
    const trustedDomain = await isTrustedDomain(emailDomain)

    if (trustedDomain) {
      const verification = await createEmailVerification(userId, transaction)

      await user.update(
        {
          status: 'PENDING_EMAIL_VERIFICATION',
        },
        { transaction }
      )

      return {
        registrationStatus: user.status as RegistrationStatus,
        nextAction: 'CONFIRM_EMAIL_CODE' as const,
        user: {
          email: user.email,
          firstName: user.firstName,
        },
        verificationCode: verification.code,
      }
    }

    await user.update(
      {
        status: 'PENDING_REVIEW',
      },
      { transaction }
    )

    return {
      registrationStatus: user.status as RegistrationStatus,
      nextAction: null,
    }
  })

  if (result.nextAction === 'CONFIRM_EMAIL_CODE') {
    const template = emailVerificationCodeTemplate({
      firstName: result.user.firstName,
      code: result.verificationCode,
    })

    try {
      await emailService.sendEmail({
        to: result.user.email,
        subject: template.subject,
        html: template.html,
      })
    } catch (error) {
      console.error(
        `Failed to enqueue verification email for user ${userId}:`,
        error
      )
    }
  }

  return {
    registrationStatus: result.registrationStatus,
    ...(result.nextAction
      ? {
          nextAction: result.nextAction,
        }
      : {}),
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

  if (user.status === 'PENDING_EMAIL_VERIFICATION') {
    throw new AppError(403, {
      code: 'REGISTRATION_PENDING_EMAIL_VERIFICATION',
      userId: user.id,
      email: user.email,
    })
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

export const listRegistrationsForAdmin = async (
  status?: RegistrationStatus
) => {
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
    const profile = user.get('registrationProfile') as
      | RegistrationProfile
      | undefined
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
            professionalExperience: profile.professionalExperience.slice(
              0,
              240
            ),
          }
        : null,
    }
  })
}

export const listUsersForAdmin = async () => {
  const users = await User.findAll({
    attributes: [
      'id',
      'role',
      'firstName',
      'lastName',
      'email',
      'status',
      'createdAt',
    ],
    include: [
      {
        model: RegistrationProfile,
        as: 'registrationProfile',
        attributes: ['updatedAt'],
        required: false,
      },
    ],
    order: [['createdAt', 'ASC']],
  })

  const userIds = users.map((user) => user.id)

  const approvedReviews =
    userIds.length > 0
      ? await RegistrationReview.findAll({
          where: {
            userId: userIds,
            decision: 'APPROVE',
          },
          attributes: ['userId', 'createdAt'],
          order: [['createdAt', 'DESC']],
        })
      : []

  const approvedAtByUserId = new Map<string, Date>()
  approvedReviews.forEach((review) => {
    if (!approvedAtByUserId.has(review.userId)) {
      approvedAtByUserId.set(review.userId, review.createdAt)
    }
  })

  return users.map((user) => {
    const profile = user.get('registrationProfile') as
      | RegistrationProfile
      | undefined

    return {
      id: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      registrationSubmittedAt: profile?.updatedAt ?? null,
      registrationApprovedAt: approvedAtByUserId.get(user.id) ?? null,
    }
  })
}

export const toggleUserRoleByAdmin = async (
  userId: string,
  adminUserId: string
) => {
  if (userId === adminUserId) {
    throw new AppError(409, { code: 'SELF_ROLE_CHANGE_NOT_ALLOWED' })
  }

  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError(404, { code: 'USER_NOT_FOUND' })
  }

  const nextRole: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
  await user.update({ role: nextRole })

  return {
    id: user.id,
    role: user.role,
  }
}

export const deleteUserByAdmin = async (
  userId: string,
  adminUserId: string
) => {
  return sequelize.transaction(async (transaction) => {
    if (userId === adminUserId) {
      throw new AppError(409, { code: 'SELF_DELETE_NOT_ALLOWED' })
    }

    const user = await User.findByPk(userId, { transaction })

    if (!user) {
      throw new AppError(404, { code: 'USER_NOT_FOUND' })
    }

    await RegistrationReview.destroy({
      where: {
        [Op.or]: [{ userId }, { reviewedBy: userId }],
      },
      transaction,
    })

    await RegistrationProfile.destroy({
      where: { userId },
      transaction,
    })

    await EmailVerification.destroy({
      where: { userId },
      transaction,
    })

    await user.destroy({ transaction })

    return {
      deleted: true,
    }
  })
}

export const getUserByIdForAdmin = async (userId: string) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
    include: [
      {
        model: RegistrationProfile,
        as: 'registrationProfile',
        attributes: [
          'motivations',
          'academicBackground',
          'professionalExperience',
        ],
        required: false,
      },
    ],
  })

  if (!user) {
    throw new AppError(404, { code: 'USER_NOT_FOUND' })
  }

  const profile = user.get('registrationProfile') as
    | RegistrationProfile
    | undefined

  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    status: user.status,
    motivations: profile?.motivations ?? null,
    academicBackground: profile?.academicBackground ?? null,
    professionalExperience: profile?.professionalExperience ?? null,
  }
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

    assertStatusTransition(user.status as RegistrationStatus, [
      'PENDING_REVIEW',
    ])

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
      user: {
        email: user.email,
        firstName: user.firstName,
      },
    }
  })
}

export const approveRegistration = async (
  userId: string,
  reviewedBy: string
) => {
  const result = await reviewRegistration(userId, reviewedBy, 'APPROVE')
  const emailTemplate = registrationApprovedTemplate({
    firstName: result.user.firstName,
  })

  try {
    await emailService.sendEmail({
      to: result.user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })
  } catch (error) {
    console.error(`Failed to enqueue approval email for user ${userId}:`, error)
  }

  return {
    registrationStatus: result.registrationStatus,
  }
}

export const rejectRegistration = async (
  userId: string,
  reviewedBy: string,
  payload: RejectReviewInput
) => {
  const result = await reviewRegistration(
    userId,
    reviewedBy,
    'REJECT',
    payload.reason,
    payload.notes
  )

  return {
    registrationStatus: result.registrationStatus,
  }
}

export const ensureAdminRole = (role: UserRole) => {
  if (role !== 'ADMIN') {
    throw new AppError(403, { code: 'FORBIDDEN' })
  }
}
