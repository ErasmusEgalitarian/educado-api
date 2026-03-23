import { Router, Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { requireRole } from '../../interface/http/middlewares/require-role'
import { submitAnswer } from '../../application/student-activities/student-activity-service'

const router = Router()

const handleError = (_req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ ...error.payload, requestId })
  }

  const unknownError = error instanceof Error ? error : null
  console.error('Student activity error:', unknownError?.message ?? error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

router.use(requireRole('STUDENT'))

router.post('/:activityId/answer', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const activityId = req.params.activityId as string
    const { answer } = req.body as { answer?: unknown }

    if (answer === undefined) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: { answer: 'REQUIRED' },
      })
    }

    const result = await submitAnswer(userId, activityId, answer)
    return res.status(200).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

export const studentActivitiesRouter = router
