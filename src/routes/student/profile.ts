import { Router, Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { requireRole } from '../../interface/http/middlewares/require-role'
import { validateStudentProfileUpdate } from '../../application/student/student-validation'
import {
  getStudentProfile,
  updateStudentProfile,
  deleteStudentAccount,
} from '../../application/student/student-service'

const router = Router()

const handleError = (_req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ ...error.payload, requestId })
  }

  const unknownError = error instanceof Error ? error : null
  console.error('Student profile error:', unknownError?.message ?? error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

router.use(requireRole('STUDENT'))

router.get('/profile', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const profile = await getStudentProfile(userId)
    return res.status(200).json(profile)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.put('/profile', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const validation = validateStudentProfileUpdate(req.body)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const profile = await updateStudentProfile(userId, validation.data)
    return res.status(200).json(profile)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.delete('/account', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    await deleteStudentAccount(userId)
    return res.status(204).send()
  } catch (error) {
    return handleError(req, res, error)
  }
})

export const studentProfileRouter = router
