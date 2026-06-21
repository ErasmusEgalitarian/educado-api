import { randomBytes } from 'crypto'
import jwt from 'jsonwebtoken'
import { UniqueConstraintError } from 'sequelize'
import { AppError } from '../common/app-error'
import { hashPassword } from '../../infrastructure/security/password-hasher'
import { getAccessTokenSecret } from '../../config/jwt'
import {
  User,
  CourseProgress,
  SectionProgress,
  Certificate,
} from '../../models/index'
import {
  StudentRegistrationInput,
  StudentProfileUpdateInput,
} from './student-validation'
import { sequelize } from '../../config/database'

const generateRandomPassword = (): string => {
  return randomBytes(32).toString('hex')
}

const signStudentToken = (userId: string): string => {
  const secret = getAccessTokenSecret()
  return jwt.sign({ sub: userId, role: 'STUDENT' }, secret, {
    expiresIn: '12h',
  })
}

export const registerStudent = async (input: StudentRegistrationInput) => {
  const passwordHash = await hashPassword(generateRandomPassword())

  // Students authenticate by phone; e-mail is not collected. We still generate
  // an internal placeholder address to satisfy the (shared) User model, which
  // is invisible to the student.
  const placeholderEmail = `student-${randomBytes(8).toString('hex')}@local`

  let user
  try {
    user = await User.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: placeholderEmail,
      emailNormalized: placeholderEmail,
      passwordHash,
      status: 'APPROVED',
      role: 'STUDENT',
      phone: input.phone,
      dateOfBirth: input.dateOfBirth ?? null,
      deviceId: input.deviceId ?? null,
    })
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, { code: 'PHONE_ALREADY_EXISTS' })
    }
    throw error
  }

  const accessToken = signStudentToken(user.id)

  return {
    accessToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  }
}

export const loginByEmail = async (email: string) => {
  const emailNormalized = email.toLowerCase().trim()

  const user = await User.findOne({
    where: { emailNormalized, role: 'STUDENT' },
  })

  if (!user) {
    throw new AppError(404, { code: 'ACCOUNT_NOT_FOUND' })
  }

  const accessToken = signStudentToken(user.id)

  await user.update({ lastLoginAt: new Date() })

  return {
    accessToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  }
}

export const loginByPhone = async (phone: string) => {
  const normalizedPhone = phone.trim()

  const user = await User.findOne({
    where: { phone: normalizedPhone, role: 'STUDENT' },
  })

  if (!user) {
    throw new AppError(404, { code: 'ACCOUNT_NOT_FOUND' })
  }

  const accessToken = signStudentToken(user.id)

  await user.update({ lastLoginAt: new Date() })

  return {
    accessToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  }
}

export const loginByDevice = async (deviceId: string) => {
  const user = await User.findOne({
    where: { deviceId, role: 'STUDENT' },
  })

  if (!user) {
    throw new AppError(404, { code: 'DEVICE_NOT_FOUND' })
  }

  const accessToken = signStudentToken(user.id)

  await user.update({ lastLoginAt: new Date() })

  return {
    accessToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  }
}

export const getStudentProfile = async (userId: string) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError(404, { code: 'USER_NOT_FOUND' })
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email.endsWith('@local') ? null : user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    avatarMediaId: user.avatarMediaId,
    deviceId: user.deviceId,
    createdAt: user.createdAt,
  }
}

export const updateStudentProfile = async (
  userId: string,
  input: StudentProfileUpdateInput
) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError(404, { code: 'USER_NOT_FOUND' })
  }

  const updateData: Record<string, unknown> = {}

  if (input.firstName !== undefined) updateData.firstName = input.firstName
  if (input.lastName !== undefined) updateData.lastName = input.lastName
  if (input.email !== undefined) {
    updateData.email = input.email
    updateData.emailNormalized = input.email.toLowerCase().trim()
  }
  if (input.phone !== undefined) updateData.phone = input.phone ?? null
  if (input.dateOfBirth !== undefined)
    updateData.dateOfBirth = input.dateOfBirth ?? null
  if (input.avatarMediaId !== undefined)
    updateData.avatarMediaId = input.avatarMediaId

  await user.update(updateData)

  return getStudentProfile(userId)
}

export const deleteStudentAccount = async (userId: string) => {
  return sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, { transaction })

    if (!user) {
      throw new AppError(404, { code: 'USER_NOT_FOUND' })
    }

    // Delete section progress for all course progress of this user
    const progressIds = (
      await CourseProgress.findAll({
        where: { userId },
        attributes: ['id'],
        transaction,
      })
    ).map((p: { id: string }) => p.id)

    if (progressIds.length > 0) {
      await SectionProgress.destroy({
        where: { courseProgressId: progressIds },
        transaction,
      })
    }

    await CourseProgress.destroy({ where: { userId }, transaction })
    await Certificate.destroy({ where: { userId }, transaction })
    await user.destroy({ transaction })

    return { deleted: true }
  })
}
