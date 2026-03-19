import { Response, Router } from 'express'
import { myCoursesList } from '../courses/courses-get'
import { requireAuth } from '../../interface/http/middlewares/auth-jwt'
import { AppError } from '../../application/common/app-error'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { listMediaByOwner } from '../../application/media/media-service'
import { User, RegistrationProfile, MediaAsset } from '../../models'
import { normalizeEmail } from '../../application/registration/registration-validation'
import { deleteOwnAccount } from '../../application/registration/registration-service'
import { sequelize } from '../../config/database'
import { requestPasswordReset } from '../../application/password-reset/password-reset-service'
import { passwordResetCodeTemplate } from '../../application/email/templates/password-reset-code'
import { createEmailService } from '../../infrastructure/email/email-factory'

const parsePagination = (query: Record<string, unknown>) => {
  const pageRaw = typeof query.page === 'string' ? Number(query.page) : 1
  const limitRaw = typeof query.limit === 'string' ? Number(query.limit) : 20

  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 20

  return { page, limit }
}

const parseMediaFilters = (query: Record<string, unknown>) => {
  const kindRaw = typeof query.kind === 'string' ? query.kind : undefined
  const statusRaw = typeof query.status === 'string' ? query.status : undefined

  const kind: 'image' | 'video' | undefined =
    kindRaw === 'image' || kindRaw === 'video' ? kindRaw : undefined
  const status: 'ACTIVE' | 'INACTIVE' | undefined =
    statusRaw === 'ACTIVE' || statusRaw === 'INACTIVE' ? statusRaw : undefined

  return { kind, status }
}

const handleError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.payload)
  }

  console.error('Unexpected me route error', error)
  return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
}

export const meRouter = Router()

meRouter.use(requireAuth)

// GET /me/courses - List courses owned by the authenticated user
meRouter.get('/courses', myCoursesList)

// GET /me/media - List media owned by authenticated user
meRouter.get('/media', async (req, res) => {
  try {
    const { userId } = getAuthContext(res)
    const { page, limit } = parsePagination(
      req.query as Record<string, unknown>
    )
    const filters = parseMediaFilters(req.query as Record<string, unknown>)

    const media = await listMediaByOwner(userId, {
      page,
      limit,
      ...filters,
    })

    return res.status(200).json(media)
  } catch (error) {
    return handleError(res, error)
  }
})

// GET /me/profile - Get authenticated user's profile
meRouter.get('/profile', async (_req, res) => {
  try {
    const { userId } = getAuthContext(res)

    const user = await User.findByPk(userId, {
      attributes: ['firstName', 'lastName', 'email', 'avatarMediaId'],
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

    return res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarMediaId: user.avatarMediaId,
      motivations: profile?.motivations ?? null,
      academicBackground: profile?.academicBackground ?? null,
      professionalExperience: profile?.professionalExperience ?? null,
    })
  } catch (error) {
    return handleError(res, error)
  }
})

// PUT /me/profile - Update authenticated user's profile
meRouter.put('/profile', async (req, res) => {
  try {
    const { userId } = getAuthContext(res)
    const {
      firstName,
      lastName,
      email,
      motivations,
      academicBackground,
      professionalExperience,
    } = req.body

    await sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(userId, { transaction })

      if (!user) {
        throw new AppError(404, { code: 'USER_NOT_FOUND' })
      }

      // Update User fields if provided
      const userUpdates: Record<string, unknown> = {}
      if (firstName !== undefined) userUpdates.firstName = firstName
      if (lastName !== undefined) userUpdates.lastName = lastName
      if (email !== undefined) {
        userUpdates.email = email
        userUpdates.emailNormalized = normalizeEmail(email)
      }

      if (Object.keys(userUpdates).length > 0) {
        await user.update(userUpdates, { transaction })
      }

      // Update or create RegistrationProfile if any profile fields provided
      const hasProfileFields =
        motivations !== undefined ||
        academicBackground !== undefined ||
        professionalExperience !== undefined

      if (hasProfileFields) {
        const existingProfile = await RegistrationProfile.findOne({
          where: { userId },
          transaction,
        })

        const profileUpdates: Record<string, unknown> = {}
        if (motivations !== undefined) profileUpdates.motivations = motivations
        if (academicBackground !== undefined)
          profileUpdates.academicBackground = academicBackground
        if (professionalExperience !== undefined)
          profileUpdates.professionalExperience = professionalExperience

        if (existingProfile) {
          await existingProfile.update(profileUpdates, { transaction })
        } else {
          await RegistrationProfile.create(
            {
              userId,
              motivations: motivations ?? '',
              academicBackground: academicBackground ?? '',
              professionalExperience: professionalExperience ?? '',
              ...profileUpdates,
            },
            { transaction }
          )
        }
      }
    })

    // Re-fetch to return updated profile
    const updatedUser = await User.findByPk(userId, {
      attributes: ['firstName', 'lastName', 'email'],
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

    const profile = updatedUser?.get('registrationProfile') as
      | RegistrationProfile
      | undefined

    return res.status(200).json({
      firstName: updatedUser!.firstName,
      lastName: updatedUser!.lastName,
      email: updatedUser!.email,
      motivations: profile?.motivations ?? null,
      academicBackground: profile?.academicBackground ?? null,
      professionalExperience: profile?.professionalExperience ?? null,
    })
  } catch (error) {
    return handleError(res, error)
  }
})

// PUT /me/avatar - Set authenticated user's avatar
meRouter.put('/avatar', async (req, res) => {
  try {
    const { userId } = getAuthContext(res)
    const { mediaId } = req.body

    if (!mediaId || typeof mediaId !== 'string') {
      throw new AppError(400, { code: 'MEDIA_ID_REQUIRED' })
    }

    const media = await MediaAsset.findByPk(mediaId)

    if (!media || media.kind !== 'image') {
      throw new AppError(404, { code: 'IMAGE_NOT_FOUND' })
    }

    const user = await User.findByPk(userId)

    if (!user) {
      throw new AppError(404, { code: 'USER_NOT_FOUND' })
    }

    await user.update({ avatarMediaId: media.id })

    return res.status(200).json({ avatarMediaId: media.id })
  } catch (error) {
    return handleError(res, error)
  }
})

// DELETE /me/avatar - Remove authenticated user's avatar
meRouter.delete('/avatar', async (_req, res) => {
  try {
    const { userId } = getAuthContext(res)

    const user = await User.findByPk(userId)

    if (!user) {
      throw new AppError(404, { code: 'USER_NOT_FOUND' })
    }

    await user.update({ avatarMediaId: null })

    return res.status(204).send()
  } catch (error) {
    return handleError(res, error)
  }
})

// DELETE /me/account - Delete authenticated user's own account
meRouter.delete('/account', async (_req, res) => {
  try {
    const { userId } = getAuthContext(res)
    await deleteOwnAccount(userId)
    return res.status(204).send()
  } catch (error) {
    return handleError(res, error)
  }
})

const mePasswordEmailService = createEmailService()

// POST /me/password/request-code - Request password change code for authenticated user
meRouter.post('/password/request-code', async (_req, res) => {
  try {
    const { userId } = getAuthContext(res)
    const user = await User.findByPk(userId)

    if (!user) {
      throw new AppError(404, { code: 'USER_NOT_FOUND' })
    }

    const result = await requestPasswordReset(user.email)

    if (result.code && result.email) {
      const template = passwordResetCodeTemplate({
        firstName: result.firstName,
        code: result.code,
      })

      await mePasswordEmailService.sendEmail({
        to: result.email,
        subject: template.subject,
        html: template.html,
      })
    }

    return res.status(200).json({ sent: true })
  } catch (error) {
    return handleError(res, error)
  }
})
