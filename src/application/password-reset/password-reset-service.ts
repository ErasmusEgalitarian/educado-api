import { randomInt } from 'crypto'
import { Op } from 'sequelize'
import { AppError } from '../common/app-error'
import {
  hashPassword,
  verifyPassword,
} from '../../infrastructure/security/password-hasher'
import { PasswordReset, User } from '../../models'
import { normalizeEmail } from '../registration/registration-validation'

const OTP_CODE_LENGTH = 4
const OTP_EXPIRATION_MINUTES = 15
const OTP_MAX_ATTEMPTS = 5
const OTP_SEND_RATE_LIMIT = 3
const OTP_SEND_RATE_WINDOW_MINUTES = 15

const PASSWORD_POLICY_REGEX = /^(?=.*[A-Za-z]).{8,}$/

const now = () => new Date()

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

const markPendingResetsAsExpired = async (userId: string) => {
  await PasswordReset.update(
    { status: 'EXPIRED' },
    {
      where: {
        userId,
        status: 'PENDING',
      },
    }
  )
}

const assertSendRateLimit = async (userId: string) => {
  const windowStart = now()
  windowStart.setMinutes(
    windowStart.getMinutes() - OTP_SEND_RATE_WINDOW_MINUTES
  )

  const recentCount = await PasswordReset.count({
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

export const requestPasswordReset = async (email: string) => {
  const emailNormalized = normalizeEmail(email)
  const user = await User.findOne({ where: { emailNormalized } })

  if (!user) {
    return { sent: true }
  }

  await assertSendRateLimit(user.id)
  await markPendingResetsAsExpired(user.id)

  const code = generateOtpCode()
  const codeHash = await hashPassword(code)
  const expiresAt = getOtpExpirationDate()

  await PasswordReset.create({
    userId: user.id,
    codeHash,
    expiresAt,
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    status: 'PENDING',
  })

  return {
    sent: true,
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    code,
  }
}

export const verifyPasswordResetCode = async (
  email: string,
  code: string
) => {
  const emailNormalized = normalizeEmail(email)
  const user = await User.findOne({ where: { emailNormalized } })

  if (!user) {
    throw new AppError(404, { code: 'USER_NOT_FOUND' })
  }

  const resetRecord = await PasswordReset.findOne({
    where: { userId: user.id },
    order: [['createdAt', 'DESC']],
  })

  if (!resetRecord) {
    throw new AppError(410, { code: 'CODE_EXPIRED' })
  }

  if (resetRecord.status === 'LOCKED') {
    throw new AppError(423, { code: 'RESET_LOCKED' })
  }

  if (resetRecord.status !== 'PENDING') {
    throw new AppError(410, { code: 'CODE_EXPIRED' })
  }

  if (resetRecord.expiresAt.getTime() < now().getTime()) {
    await resetRecord.update({ status: 'EXPIRED' })
    throw new AppError(410, { code: 'CODE_EXPIRED' })
  }

  const matches = await verifyPassword(code, resetRecord.codeHash)

  if (!matches) {
    const nextAttempts = resetRecord.attempts + 1
    const shouldLock = nextAttempts >= resetRecord.maxAttempts

    await resetRecord.update({
      attempts: nextAttempts,
      status: shouldLock ? 'LOCKED' : resetRecord.status,
    })

    if (shouldLock) {
      throw new AppError(423, { code: 'RESET_LOCKED' })
    }

    throw new AppError(422, {
      code: 'VALIDATION_ERROR',
      fieldErrors: {
        code: 'INVALID_CODE',
      },
    })
  }

  await resetRecord.update({
    status: 'VERIFIED',
    verifiedAt: now(),
  })

  return { verified: true }
}

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  const emailNormalized = normalizeEmail(email)
  const user = await User.findOne({ where: { emailNormalized } })

  if (!user) {
    throw new AppError(404, { code: 'USER_NOT_FOUND' })
  }

  const resetRecord = await PasswordReset.findOne({
    where: {
      userId: user.id,
      status: 'VERIFIED',
    },
    order: [['createdAt', 'DESC']],
  })

  if (!resetRecord) {
    throw new AppError(410, { code: 'CODE_EXPIRED' })
  }

  const matches = await verifyPassword(code, resetRecord.codeHash)

  if (!matches) {
    throw new AppError(422, {
      code: 'VALIDATION_ERROR',
      fieldErrors: {
        code: 'INVALID_CODE',
      },
    })
  }

  if (!PASSWORD_POLICY_REGEX.test(newPassword)) {
    throw new AppError(422, {
      code: 'VALIDATION_ERROR',
      fieldErrors: {
        newPassword: 'PASSWORD_POLICY',
      },
    })
  }

  const passwordHash = await hashPassword(newPassword)
  await user.update({ passwordHash })
  await resetRecord.update({ status: 'EXPIRED' })

  return { reset: true }
}
