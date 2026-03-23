import { Router, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { AppError } from '../../application/common/app-error'
import {
  getGlobalMonthlyLeaderboard,
  getCourseLeaderboard,
} from '../../application/leaderboard/leaderboard-service'
import { getAccessTokenSecret } from '../../config/jwt'

const router = Router()

const handleError = (_req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ ...error.payload, requestId })
  }

  const unknownError = error instanceof Error ? error : null
  console.error('Leaderboard error:', unknownError?.message ?? error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

// Extract userId from optional auth token (don't require auth)
const extractOptionalUserId = (req: Request): string | undefined => {
  const authorization = req.headers.authorization
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null

  if (!token) return undefined

  try {
    const secret = getAccessTokenSecret()
    const decoded = jwt.verify(token, secret) as JwtPayload
    return typeof decoded.sub === 'string' ? decoded.sub : undefined
  } catch {
    return undefined
  }
}

router.get('/global', async (req: Request, res: Response) => {
  try {
    const month = req.query.month as string | undefined
    const userId = extractOptionalUserId(req)
    const result = await getGlobalMonthlyLeaderboard(month, userId)
    return res.status(200).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/courses/:courseId', async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string
    const month = req.query.month as string | undefined
    const userId = extractOptionalUserId(req)
    const result = await getCourseLeaderboard(courseId, month, userId)
    return res.status(200).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

export const leaderboardRouter = router
