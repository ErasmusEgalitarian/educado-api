import { Router, Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import {
  listPublicCourses,
  getPublicCourseDetail,
  listPublicCategories,
} from '../../application/catalog/catalog-service'
import {
  getCourseReviews,
  getReviewSummary,
} from '../../application/reviews/review-service'

const router = Router()

const handleError = (_req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ ...error.payload, requestId })
  }

  const unknownError = error instanceof Error ? error : null
  console.error('Catalog error:', unknownError?.message ?? error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

router.get('/courses', async (req: Request, res: Response) => {
  try {
    const result = await listPublicCourses({
      q: req.query.q as string | undefined,
      category: req.query.category as string | undefined,
      difficulty: req.query.difficulty as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    })
    return res.status(200).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await listPublicCategories()
    return res.status(200).json({ categories })
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/courses/:id', async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id as string
    const result = await getPublicCourseDetail(courseId)
    return res.status(200).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/courses/:id/reviews', async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id as string
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const [reviews, summary] = await Promise.all([
      getCourseReviews(courseId, page, limit),
      getReviewSummary(courseId),
    ])
    return res.status(200).json({ ...reviews, summary })
  } catch (error) {
    return handleError(req, res, error)
  }
})

export const catalogRouter = router
