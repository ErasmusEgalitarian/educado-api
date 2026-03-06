import { Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import {
  buildCourseWhereClause,
  ensureAdmin,
  findCourseByIdForActor,
  parseCourseStatus,
} from '../../application/courses/course-access-service'
import { Course, Section, Activity, Tag } from '../../models'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { requireParam } from '../../utils/request-params'

const toQueryString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined
}

const handleError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.payload)
  }

  console.error('Unexpected courses route error', error)
  return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
}

export const coursesList = async (req: Request, res: Response) => {
  try {
    const auth = getAuthContext(res)
    ensureAdmin(auth)

    const where = buildCourseWhereClause({
      status: parseCourseStatus(req.query.status),
      category: toQueryString(req.query.category),
      difficulty: toQueryString(req.query.difficulty),
      q: toQueryString(req.query.q),
    })

    const courses = await Course.findAll({
      where,
      include: [
        {
          model: Tag,
          as: 'reusableTags',
          through: { attributes: [] },
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    return res.json(
      courses.map((course) => {
        const data = course.toJSON() as Record<string, unknown>
        return {
          ...data,
          ownerId: course.ownerId,
        }
      })
    )
  } catch (error) {
    return handleError(res, error)
  }
}

export const myCoursesList = async (req: Request, res: Response) => {
  try {
    const auth = getAuthContext(res)

    const where = buildCourseWhereClause(
      {
        status: parseCourseStatus(req.query.status),
        category: toQueryString(req.query.category),
        difficulty: toQueryString(req.query.difficulty),
        q: toQueryString(req.query.q),
      },
      auth.userId
    )

    const courses = await Course.findAll({
      where,
      include: [
        {
          model: Tag,
          as: 'reusableTags',
          through: { attributes: [] },
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    return res.json(courses)
  } catch (error) {
    return handleError(res, error)
  }
}

export const coursesGet = async (req: Request, res: Response) => {
  try {
    const id = requireParam(req.params.id)
    const auth = getAuthContext(res)

    const course = await findCourseByIdForActor(id, auth, {
      include: [
        {
          model: Section,
          as: 'sections',
          include: [
            {
              model: Activity,
              as: 'activities',
              order: [['order', 'ASC']],
            },
          ],
          order: [['order', 'ASC']],
        },
        {
          model: Tag,
          as: 'reusableTags',
          through: { attributes: [] },
        },
      ],
    })

    return res.json(course)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Missing required parameter')
    ) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: { id: 'REQUIRED' },
      })
    }

    return handleError(res, error)
  }
}
