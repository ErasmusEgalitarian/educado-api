import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { AppError } from '../../application/common/app-error'
import {
  buildTagSlug,
  validateTagPayload,
} from '../../application/tags/tag-validation'
import { Tag, CourseTag } from '../../models'

const handleError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.payload)
  }

  console.error('Unexpected tags route error', error)
  return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
}

const ensureTagNameUnique = async (name: string, ignoreId?: string) => {
  const slug = buildTagSlug(name)

  const where = ignoreId
    ? {
        [Op.and]: [
          {
            [Op.or]: [{ name }, { slug }],
          },
          {
            id: { [Op.ne]: ignoreId },
          },
        ],
      }
    : {
        [Op.or]: [{ name }, { slug }],
      }

  const existingTag = await Tag.findOne({ where })

  if (existingTag) {
    throw new AppError(422, {
      code: 'VALIDATION_ERROR',
      fieldErrors: {
        name: 'ALREADY_EXISTS',
      },
    })
  }

  return slug
}

export const tagsList = async (_req: Request, res: Response) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']],
    })

    return res.status(200).json(tags)
  } catch (error) {
    return handleError(res, error)
  }
}

export const tagsGetById = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : ''

    const tag = await Tag.findByPk(id)

    if (!tag) {
      throw new AppError(404, { code: 'TAG_NOT_FOUND' })
    }

    return res.status(200).json(tag)
  } catch (error) {
    return handleError(res, error)
  }
}

export const tagsCreate = async (req: Request, res: Response) => {
  try {
    const validation = validateTagPayload(req.body)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const slug = await ensureTagNameUnique(validation.data.name)

    const tag = await Tag.create({
      name: validation.data.name,
      slug,
      description: validation.data.description ?? null,
      isActive: validation.data.isActive ?? true,
    })

    return res.status(201).json(tag)
  } catch (error) {
    return handleError(res, error)
  }
}

export const tagsUpdate = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : ''

    const tag = await Tag.findByPk(id)

    if (!tag) {
      throw new AppError(404, { code: 'TAG_NOT_FOUND' })
    }

    const validation = validateTagPayload(req.body, true)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const updateData: Record<string, unknown> = {}

    if (validation.data.name !== undefined) {
      const slug = await ensureTagNameUnique(validation.data.name, tag.id)
      updateData.name = validation.data.name
      updateData.slug = slug
    }

    if (validation.data.description !== undefined) {
      updateData.description = validation.data.description || null
    }

    if (validation.data.isActive !== undefined) {
      updateData.isActive = validation.data.isActive
    }

    await tag.update(updateData)

    return res.status(200).json(tag)
  } catch (error) {
    return handleError(res, error)
  }
}

export const tagsDelete = async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : ''

    const tag = await Tag.findByPk(id)

    if (!tag) {
      throw new AppError(404, { code: 'TAG_NOT_FOUND' })
    }

    await CourseTag.destroy({ where: { tagId: tag.id } })
    await tag.destroy()

    return res.status(204).send()
  } catch (error) {
    return handleError(res, error)
  }
}
