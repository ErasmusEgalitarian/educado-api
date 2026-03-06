import { Router, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { AppError } from '../../application/common/app-error'
import {
  getRegistrationStatus,
  login,
  registerUser,
  submitRegistrationProfile,
} from '../../application/registration/registration-service'
import {
  normalizeEmail,
  validateCreateRegistrationInput,
  validateLoginInput,
  validateRegistrationProfileInput,
} from '../../application/registration/registration-validation'
import {
  getAuthContext,
  requireAuth,
} from '../../interface/http/middlewares/auth-jwt'

export const authRouter = Router()

const registrationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'RATE_LIMITED' },
  statusCode: 429,
})

const handleError = (req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    console.error(
      JSON.stringify({
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: error.statusCode,
        errorCode: error.payload.code,
      })
    )

    return res.status(error.statusCode).json({
      ...error.payload,
      requestId,
    })
  }

  const unknownError = error as Error

  console.error(
    JSON.stringify({
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: unknownError?.message,
      stack: unknownError?.stack,
    })
  )

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

authRouter.post(
  '/registrations',
  registrationRateLimit,
  async (req: Request, res: Response) => {
    try {
      const validation = validateCreateRegistrationInput(req.body)

      if (!validation.data) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: validation.fieldErrors,
        })
      }

      const response = await registerUser({
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        email: normalizeEmail(validation.data.email),
        password: validation.data.password,
      })

      return res.status(201).json(response)
    } catch (error) {
      return handleError(req, res, error)
    }
  }
)

authRouter.put(
  '/registrations/:userId/profile',
  async (req: Request, res: Response) => {
    try {
      const validation = validateRegistrationProfileInput(req.body)

      if (!validation.data) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: validation.fieldErrors,
        })
      }

      const userId =
        typeof req.params.userId === 'string' ? req.params.userId.trim() : ''

      if (!userId) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: { userId: 'REQUIRED' },
        })
      }

      const response = await submitRegistrationProfile(userId, validation.data)

      const statusCode =
        response.nextAction === 'CONFIRM_EMAIL_CODE' ? 202 : 200

      return res.status(statusCode).json(response)
    } catch (error) {
      return handleError(req, res, error)
    }
  }
)

authRouter.put(
  '/registrations/me/profile',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const validation = validateRegistrationProfileInput(req.body)

      if (!validation.data) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: validation.fieldErrors,
        })
      }

      const { userId } = getAuthContext(res)
      const response = await submitRegistrationProfile(userId, validation.data)

      const statusCode =
        response.nextAction === 'CONFIRM_EMAIL_CODE' ? 202 : 200

      return res.status(statusCode).json(response)
    } catch (error) {
      return handleError(req, res, error)
    }
  }
)

authRouter.get(
  '/registrations/me/status',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId } = getAuthContext(res)
      const response = await getRegistrationStatus(userId)
      return res.status(200).json(response)
    } catch (error) {
      return handleError(req, res, error)
    }
  }
)

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const validation = validateLoginInput(req.body)
    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const response = await login(validation.data)
    return res.status(200).json(response)
  } catch (error) {
    return handleError(req, res, error)
  }
})
