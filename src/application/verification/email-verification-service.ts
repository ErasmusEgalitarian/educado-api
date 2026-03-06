import { randomInt, randomUUID } from 'crypto'
import { Op, Transaction } from 'sequelize'
import { AppError } from '../common/app-error'
import {
  hashPassword,
  verifyPassword,
} from '../../infrastructure/security/password-hasher'
import {
  EmailVerification,
  Institution,
  RegistrationReview,
  User,
} from '../../models'

const OTP_CODE_LENGTH = 6
const OTP_EXPIRATION_MINUTES = 15
const OTP_MAX_ATTEMPTS = 5
const OTP_SEND_RATE_LIMIT = 3
const OTP_SEND_RATE_WINDOW_MINUTES = 15
const AUTO_APPROVE_REASON = 'AUTO_EMAIL_DOMAIN_VERIFIED'

const SYSTEM_REVIEWER_EMAIL =
  process.env.SYSTEM_REVIEWER_EMAIL ?? 'system@educado.local'

const now = () => new Date()

const normalizeDomain = (domain: string) => {
  return domain.trim().replace(/^@+/, '').toLowerCase()
}

export const extractDomainFromEmail = (emailNormalized: string) => {
  const [, domainRaw = ''] = emailNormalized.split('@')
  return normalizeDomain(domainRaw)
}

const generateOtpCode = () => {
  return String(randomInt(0, 10 ** OTP_CODE_LENGTH)).padStart(
    OTP_CODE_LENGTH,
    '0'
  )
}

const getOtpExpirationDate = () => {
  const expiration = now()
  expiration.setMinutes(expiration.getMinutes() + OTP_EXPIRATION_MINUTES)
  return expiration
}

const markPendingVerificationsAsExpired = async (
  userId: string,
  transaction?: Transaction
) => {
  await EmailVerification.update(
    {
      status: 'EXPIRED',
    },
    {
      where: {
        userId,
        status: 'PENDING',
      },
      transaction,
    }
  )
}

const assertSendRateLimit = async (userId: string) => {
  const windowStart = now()
  windowStart.setMinutes(
    windowStart.getMinutes() - OTP_SEND_RATE_WINDOW_MINUTES
  )

  const recentCount = await EmailVerification.count({
    where: {
      userId,
      createdAt: {
        [Op.gte]: windowStart,
      },
    },
  })

  if (recentCount >= OTP_SEND_RATE_LIMIT) {
    throw new AppError(429, { code: 'RATE_LIMITED' })
  }
}

const ensureSystemReviewerUser = async (transaction?: Transaction) => {
  const emailNormalized = SYSTEM_REVIEWER_EMAIL.trim().toLowerCase()
  const existing = await User.findOne({
    where: { emailNormalized },
    transaction,
  })

  if (existing) {
    return existing
  }

  const randomPassword = randomUUID()
  const passwordHash = await hashPassword(randomPassword)

  return User.create(
    {
      firstName: 'System',
      lastName: 'Reviewer',
      email: SYSTEM_REVIEWER_EMAIL,
      emailNormalized,
      passwordHash,
      status: 'APPROVED',
      role: 'ADMIN',
    },
    { transaction }
  )
}

export const isTrustedDomain = async (domain: string): Promise<boolean> => {
  const normalized = normalizeDomain(domain)
  if (!normalized) {
    return false
  }

  const institution = await Institution.findOne({
    where: {
      isActive: true,
      [Op.or]: [{ domain: normalized }, { secondaryDomain: normalized }],
    },
  })

  return Boolean(institution)
}

export const createEmailVerification = async (
  userId: string,
  transaction?: Transaction
) => {
  const code = generateOtpCode()
  const codeHash = await hashPassword(code)
  const expiresAt = getOtpExpirationDate()

  await markPendingVerificationsAsExpired(userId, transaction)

  await EmailVerification.create(
    {
      userId,
      codeHash,
      expiresAt,
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      status: 'PENDING',
    },
    { transaction }
  )

  return {
    code,
    expiresAt,
  }
}

export const sendEmailVerificationCode = async (userId: string) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError(404, { code: 'USER_NOT_FOUND' })
  }

  if (user.status !== 'PENDING_EMAIL_VERIFICATION') {
    throw new AppError(409, { code: 'VERIFICATION_NOT_ALLOWED_FOR_STATUS' })
  }

  await assertSendRateLimit(userId)

  const verification = await createEmailVerification(userId)
  return {
    email: user.email,
    firstName: user.firstName,
    code: verification.code,
  }
}

export const confirmEmailVerification = async (
  userId: string,
  code: string
) => {
  return EmailVerification.sequelize!.transaction(async (transaction) => {
    const user = await User.findByPk(userId, { transaction })

    if (!user) {
      throw new AppError(404, { code: 'USER_NOT_FOUND' })
    }

    if (user.status !== 'PENDING_EMAIL_VERIFICATION') {
      throw new AppError(409, { code: 'VERIFICATION_NOT_ALLOWED_FOR_STATUS' })
    }

    const verification = await EmailVerification.findOne({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
      transaction,
    })

    if (!verification) {
      throw new AppError(410, { code: 'CODE_EXPIRED' })
    }

    if (verification.status === 'LOCKED') {
      throw new AppError(423, { code: 'VERIFICATION_LOCKED' })
    }

    if (verification.status !== 'PENDING') {
      throw new AppError(410, { code: 'CODE_EXPIRED' })
    }

    if (verification.expiresAt.getTime() < now().getTime()) {
      await verification.update(
        {
          status: 'EXPIRED',
        },
        { transaction }
      )
      throw new AppError(410, { code: 'CODE_EXPIRED' })
    }

    const matches = await verifyPassword(code, verification.codeHash)

    if (!matches) {
      const nextAttempts = verification.attempts + 1
      const shouldLock = nextAttempts >= verification.maxAttempts

      await verification.update(
        {
          attempts: nextAttempts,
          status: shouldLock ? 'LOCKED' : verification.status,
        },
        { transaction }
      )

      if (shouldLock) {
        await user.update(
          {
            status: 'PENDING_REVIEW',
          },
          { transaction }
        )

        throw new AppError(423, { code: 'VERIFICATION_LOCKED' })
      }

      throw new AppError(422, {
        code: 'VALIDATION_ERROR',
        fieldErrors: {
          code: 'INVALID_CODE',
        },
      })
    }

    const domain = extractDomainFromEmail(user.emailNormalized)
    const systemReviewer = await ensureSystemReviewerUser(transaction)

    await verification.update(
      {
        status: 'VERIFIED',
        verifiedAt: now(),
      },
      { transaction }
    )

    await user.update(
      {
        status: 'APPROVED',
      },
      { transaction }
    )

    await RegistrationReview.create(
      {
        userId: user.id,
        reviewedBy: systemReviewer.id,
        decision: 'APPROVE',
        reason: AUTO_APPROVE_REASON,
        notes: `Domain verified: ${domain}`,
      },
      { transaction }
    )

    return {
      status: user.status,
    }
  })
}
