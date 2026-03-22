import { Router, Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { requireRole } from '../../interface/http/middlewares/require-role'
import {
  getGamificationSummary,
  getStudentBadges,
  getPointsHistory,
} from '../../application/gamification/gamification-service'

const router = Router()

const handleError = (_req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ ...error.payload, requestId })
  }

  const unknownError = error instanceof Error ? error : null
  console.error('Gamification error:', unknownError?.message ?? error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

router.use(requireRole('STUDENT'))

router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const summary = await getGamificationSummary(userId)
    return res.status(200).json(summary)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/badges', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const badges = await getStudentBadges(userId)
    return res.status(200).json({ badges })
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/points-history', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const history = await getPointsHistory(userId, page, limit)
    return res.status(200).json(history)
  } catch (error) {
    return handleError(req, res, error)
  }
})

export const studentGamificationRouter = router
