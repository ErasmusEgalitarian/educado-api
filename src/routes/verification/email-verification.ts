import { Request, Response, Router } from 'express'
import { AppError } from '../../application/common/app-error'
import { createEmailService } from '../../infrastructure/email/email-factory'
import {
  confirmEmailVerification,
  sendEmailVerificationCode,
} from '../../application/verification/email-verification-service'
import { emailVerificationCodeTemplate } from '../../application/email/templates/email-verification-code'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { validateConfirmEmailVerificationInput } from '../../application/verification/email-verification-validation'

export const emailVerificationRouter = Router()
const emailService = createEmailService()

const handleError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.payload)
  }

  console.error('Unexpected email verification route error', error)
  return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
}

const resolveVerificationUserId = (req: Request, res: Response) => {
  const userIdFromBody =
    typeof req.body?.userId === 'string' ? req.body.userId.trim() : ''

  if (userIdFromBody) {
    return userIdFromBody
  }

  const authContext = res.locals.auth ? getAuthContext(res) : undefined

  if (authContext?.userId) {
    return authContext.userId
  }

  throw new AppError(422, {
    code: 'VALIDATION_ERROR',
    fieldErrors: {
      userId: 'REQUIRED',
    },
  })
}

emailVerificationRouter.post('/send', async (req: Request, res: Response) => {
  try {
    const userId = resolveVerificationUserId(req, res)
    const result = await sendEmailVerificationCode(userId)
    const template = emailVerificationCodeTemplate({
      firstName: result.firstName,
      code: result.code,
    })

    await emailService.sendEmail({
      to: result.email,
      subject: template.subject,
      html: template.html,
    })

    return res.status(202).json({
      status: 'PENDING_EMAIL_VERIFICATION',
      nextAction: 'CONFIRM_EMAIL_CODE',
    })
  } catch (error) {
    return handleError(res, error)
  }
})

emailVerificationRouter.post(
  '/confirm',
  async (req: Request, res: Response) => {
    try {
      const validation = validateConfirmEmailVerificationInput(req.body)

      if (!validation.data) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: validation.fieldErrors,
        })
      }

      const userId = resolveVerificationUserId(req, res)
      const result = await confirmEmailVerification(
        userId,
        validation.data.code
      )

      return res.status(200).json(result)
    } catch (error) {
      return handleError(res, error)
    }
  }
)
