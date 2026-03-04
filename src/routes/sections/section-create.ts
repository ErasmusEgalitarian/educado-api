/* eslint-disable prettier/prettier */
import { Request, Response } from 'express'
import { Section } from '../../models/section.model'

const MEDIA_ID_REGEX = /^[a-f\d]{24}$/i

type SectionPayload = {
  id?: string
  courseId?: string
  title?: string
  videoMediaId?: string | null
  thumbnailMediaId?: string | null
  duration?: number | null
  order?: number
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const validateSectionPayload = (
  payload: unknown,
  partial = false
): { data: SectionPayload | null; fieldErrors: Record<string, string> } => {
  const body = (payload ?? {}) as Record<string, unknown>
  const fieldErrors: Record<string, string> = {}

  const id = normalizeText(body.id)
  const courseId = normalizeText(body.courseId)
  const title = normalizeText(body.title)
  const videoMediaId =
    body.videoMediaId === null ? null : normalizeText(body.videoMediaId)
  const thumbnailMediaId =
    body.thumbnailMediaId === null
      ? null
      : normalizeText(body.thumbnailMediaId)

  const hasDuration = body.duration !== undefined
  const duration =
    body.duration === null
      ? null
      : typeof body.duration === 'number' && Number.isInteger(body.duration)
      ? body.duration
      : NaN

  const hasOrder = body.order !== undefined
  const order =
    typeof body.order === 'number' && Number.isInteger(body.order)
      ? body.order
      : NaN

  if (!partial || body.id !== undefined) {
    if (!id) fieldErrors.id = 'REQUIRED'
  }

  if (!partial || body.courseId !== undefined) {
    if (!courseId) fieldErrors.courseId = 'REQUIRED'
  }

  if (!partial || body.title !== undefined) {
    if (!title) fieldErrors.title = 'REQUIRED'
  }

  if (!partial || hasOrder) {
    if (Number.isNaN(order) || order < 0) {
      fieldErrors.order = 'INVALID'
    }
  }

  if (hasDuration && duration !== null && (Number.isNaN(duration) || duration < 0)) {
    fieldErrors.duration = 'INVALID'
  }

  if (
    body.videoMediaId !== undefined ||
    (!partial && videoMediaId !== null)
  ) {
    if (videoMediaId && !MEDIA_ID_REGEX.test(videoMediaId)) {
      fieldErrors.videoMediaId = 'INVALID'
    }
  }

  if (
    body.thumbnailMediaId !== undefined ||
    (!partial && thumbnailMediaId !== null)
  ) {
    if (thumbnailMediaId && !MEDIA_ID_REGEX.test(thumbnailMediaId)) {
      fieldErrors.thumbnailMediaId = 'INVALID'
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  const data: SectionPayload = {}

  if (!partial || body.id !== undefined) data.id = id
  if (!partial || body.courseId !== undefined) data.courseId = courseId
  if (!partial || body.title !== undefined) data.title = title
  if (!partial || hasOrder) data.order = Number.isNaN(order) ? 0 : order

  if (body.videoMediaId !== undefined) {
    data.videoMediaId = videoMediaId || null
  } else if (!partial) {
    data.videoMediaId = null
  }

  if (body.thumbnailMediaId !== undefined) {
    data.thumbnailMediaId = thumbnailMediaId || null
  } else if (!partial) {
    data.thumbnailMediaId = null
  }

  if (hasDuration || !partial) {
    data.duration = duration === null ? null : Number.isNaN(duration) ? null : duration
  }

  return { data, fieldErrors }
}

export async function sectionsCreate(req: Request, res: Response) {
  try {
    const validation = validateSectionPayload(req.body)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const sectionData = validation.data
    const section = await Section.create(sectionData)
    res.status(201).json(section)
  } catch (error) {
    console.error('Error creating section:', error)
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
      res.status(400).json({
        error: 'Validation error',
        message: error.message,
      })
    } else {
      res.status(500).json({
        error: 'Failed to create section',
      })
    }
  }
}

export async function sectionsUpdate(req: Request, res: Response) {
    try {
        const id = req.params.id as string
    const validation = validateSectionPayload(req.body, true)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const sectionData = validation.data
        const [updated] = await Section.update(sectionData, {
            where: { id },
        })
        
        if (!updated) {
            return res.status(404).json({ error: 'Section not found' })
        }
        const section = await Section.findByPk(id)
        res.json(section)
    } catch (error) {
        console.error('Error updating section:', error)
        res.status(500).json({ error: 'Failed to update section' })
    }
}

export async function sectionsDelete(req: Request, res: Response) {
    try {
        const id = req.params.id as string
        const deleted = await Section.destroy({
            where: { id },
        })
        
        if (!deleted) {
            return res.status(404).json({ error: 'Section not found' })
        }
        res.status(204).send()
    }
    catch (error) {
        console.error('Error deleting section:', error)
        res.status(500).json({ error: 'Failed to delete section' })
    }
}