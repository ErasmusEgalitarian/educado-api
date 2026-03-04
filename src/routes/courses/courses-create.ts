import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { AppError } from '../../application/common/app-error'
import { findCourseByIdForActor } from '../../application/courses/course-access-service'
import { validateCoursePayload } from '../../application/courses/course-validation'
import { validateTagIds } from '../../application/tags/tag-validation'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { Course, CourseTag, Tag } from '../../models'

const resolveTags = async (tagIds: string[]) => {
  const tags = await Tag.findAll({ where: { id: { [Op.in]: tagIds } } })

  if (tags.length !== tagIds.length) {
    throw new AppError(422, {
      code: 'VALIDATION_ERROR',
      fieldErrors: {
        tagIds: 'INVALID_TAG_REFERENCE',
      },
    })
  }

  return tags
}

const attachCourseTags = async (courseId: string, tagIds: string[]) => {
  await CourseTag.destroy({ where: { courseId } })

  if (tagIds.length === 0) {
    return
  }

  await CourseTag.bulkCreate(
    tagIds.map((tagId) => ({
      courseId,
      tagId,
    }))
  )
}

const getTagIdsFromBody = (value: unknown) => {
  if (value === undefined) {
    return {
      tagIds: [] as string[],
      fieldErrors: {} as Record<string, string>,
    }
  }

  return validateTagIds(value)
}

export async function coursesCreate(req: Request, res: Response) {
  try {
    const auth = getAuthContext(res)
    const validation = validateCoursePayload(req.body)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const validatedTagIds = getTagIdsFromBody(req.body.tagIds)

    if (!validatedTagIds.tagIds) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validatedTagIds.fieldErrors,
      })
    }

    const tags = await resolveTags(validatedTagIds.tagIds)

    const course = await Course.create({
      ...validation.data,
      tags: tags.map((tag) => tag.name),
      ownerId: auth.userId,
      isActive: true,
    })

    await attachCourseTags(course.id, validatedTagIds.tagIds)

    const createdCourse = await Course.findByPk(course.id, {
      include: [
        {
          model: Tag,
          as: 'reusableTags',
          through: { attributes: [] },
        },
      ],
    })

    return res.status(201).json(createdCourse)
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    if (
      error instanceof Error &&
      'name' in error &&
      (error as { name?: string }).name === 'SequelizeDatabaseError' &&
      'original' in error &&
      (error as { original?: { code?: string } }).original?.code === '22001'
    ) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: {
          imageUrl: 'LENGTH_INVALID',
        },
      })
    }

    console.error('Error creating course:', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
}

export async function coursesUpdate(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const auth = getAuthContext(res)
    const validation = validateCoursePayload(req.body)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const validatedTagIds = getTagIdsFromBody(req.body.tagIds)

    if (!validatedTagIds.tagIds) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validatedTagIds.fieldErrors,
      })
    }

    const tags = await resolveTags(validatedTagIds.tagIds)

    const course = await findCourseByIdForActor(id, auth)

    await course.update({
      ...validation.data,
      tags: tags.map((tag) => tag.name),
      ownerId: course.ownerId,
    })

    await attachCourseTags(course.id, validatedTagIds.tagIds)

    const updatedCourse = await Course.findByPk(course.id, {
      include: [
        {
          model: Tag,
          as: 'reusableTags',
          through: { attributes: [] },
        },
      ],
    })

    return res.json(updatedCourse)
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    if (
      error instanceof Error &&
      'name' in error &&
      (error as { name?: string }).name === 'SequelizeDatabaseError' &&
      'original' in error &&
      (error as { original?: { code?: string } }).original?.code === '22001'
    ) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: {
          imageUrl: 'LENGTH_INVALID',
        },
      })
    }

    console.error('Error updating course:', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
}

export async function coursesActivate(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const auth = getAuthContext(res)

    const course = await findCourseByIdForActor(id, auth)

    await course.update({ isActive: true })

    return res.status(200).json(course)
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    console.error('Error activating course:', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
}

export async function coursesDeactivate(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const auth = getAuthContext(res)

    const course = await findCourseByIdForActor(id, auth)

    await course.update({ isActive: false })

    return res.status(200).json(course)
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    console.error('Error deactivating course:', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
}

export async function coursesDelete(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const auth = getAuthContext(res)

    const course = await findCourseByIdForActor(id, auth)

    await course.destroy()

    return res.status(204).send()
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    console.error('Error deleting course:', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
}
