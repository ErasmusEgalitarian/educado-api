import { Router, Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { requireRole } from '../../interface/http/middlewares/require-role'
import {
  enrollStudent,
  listStudentEnrollments,
  getEnrollmentDetail,
  dropEnrollment,
} from '../../application/enrollment/enrollment-service'

const router = Router()

const handleError = (_req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ ...error.payload, requestId })
  }

  const unknownError = error instanceof Error ? error : null
  console.error('Enrollment error:', unknownError?.message ?? error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

router.use(requireRole('STUDENT'))

router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const { courseId } = req.body as { courseId?: string }

    if (!courseId || typeof courseId !== 'string') {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: { courseId: 'REQUIRED' },
      })
    }

    const result = await enrollStudent(userId, courseId)
    return res.status(201).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const enrollments = await listStudentEnrollments(userId)
    return res.status(200).json({ enrollments })
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/:courseId', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const courseId = req.params.courseId as string
    const detail = await getEnrollmentDetail(userId, courseId)
    return res.status(200).json(detail)
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.delete('/:courseId', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const courseId = req.params.courseId as string
    const result = await dropEnrollment(userId, courseId)
    return res.status(200).json(result)
  } catch (error) {
    return handleError(req, res, error)
  }
})

export const studentEnrollmentsRouter = router
