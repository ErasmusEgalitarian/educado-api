import { Router, Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import { validateStudentRegistration } from '../../application/student/student-validation'
import {
  registerStudent,
  loginByDevice,
  loginByEmail,
} from '../../application/student/student-service'

const router = Router()

const handleError = (_req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ ...error.payload, requestId })
  }

  const unknownError = error instanceof Error ? error : null
  console.error('Student auth error:', unknownError?.message ?? error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const validation = validateStudentRegistration(req.body)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const result = await registerStudent(validation.data)
    return res.status(201).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.post('/device-login', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body as { deviceId?: string }

    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: { deviceId: 'REQUIRED' },
      })
    }

    const result = await loginByDevice(deviceId.trim())
    return res.status(200).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.post('/email-login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: { email: 'REQUIRED' },
      })
    }

    const result = await loginByEmail(email.trim())
    return res.status(200).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

export const studentAuthRouter = router
