import { Router, Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { requireRole } from '../../interface/http/middlewares/require-role'
import {
  listStudentCourseProgress,
  getStudentCourseProgress,
  saveStudentSectionProgress,
  completeStudentCourse,
} from '../../application/student-progress/student-progress-service'

const router = Router()

const handleError = (_req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ ...error.payload, requestId })
  }

  const unknownError = error instanceof Error ? error : null
  console.error('Student progress error:', unknownError?.message ?? error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

router.use(requireRole('STUDENT'))

router.get('/courses', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const progress = await listStudentCourseProgress(userId)
    return res.status(200).json({ progress })
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/courses/:courseId', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const courseId = req.params.courseId as string
    const progress = await getStudentCourseProgress(userId, courseId)
    return res.status(200).json(progress)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.post(
  '/courses/:courseId/sections/:sectionId',
  async (req: Request, res: Response) => {
    try {
      const { userId } = getAuthContext(res)
      const courseId = req.params.courseId as string
      const sectionId = req.params.sectionId as string
      const { score, totalQuestions } = req.body as {
        score?: number
        totalQuestions?: number
      }

      if (
        typeof score !== 'number' ||
        typeof totalQuestions !== 'number' ||
        score < 0 ||
        totalQuestions < 0
      ) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: {
            ...(typeof score !== 'number' ? { score: 'REQUIRED' } : {}),
            ...(typeof totalQuestions !== 'number'
              ? { totalQuestions: 'REQUIRED' }
              : {}),
          },
        })
      }

      const result = await saveStudentSectionProgress(
        userId,
        courseId,
        sectionId,
        score,
        totalQuestions
      )
      return res.status(200).json(result)
    } catch (error) {
      return handleError(req, res, error)
    }
  }
)

router.put(
  '/courses/:courseId/complete',
  async (req: Request, res: Response) => {
    try {
      const { userId } = getAuthContext(res)
      const courseId = req.params.courseId as string
      const result = await completeStudentCourse(userId, courseId)
      return res.status(200).json(result)
    } catch (error) {
      return handleError(req, res, error)
    }
  }
)

export const studentProgressRouter = router
