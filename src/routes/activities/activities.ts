import { Router } from 'express'
import { Request, Response } from 'express'
import { validateDbActivityPayload } from '../../application/activities/activity-validation-db'
import { Activity } from '../../models/activity.model'

export const activitiesRouter = Router()

const handleError = (res: Response, error: unknown) => {
  if (
    error instanceof Error &&
    'name' in error &&
    (error as { name?: string }).name === 'SequelizeForeignKeyConstraintError' &&
    'table' in error &&
    (error as { table?: string }).table === 'activities'
  ) {
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      fieldErrors: {
        sectionId: 'INVALID_REFERENCE',
      },
    })
  }

  console.error('Error in activities route:', error)
  return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
}

// GET /activities/section/:sectionId - Get all activities for a section
activitiesRouter.get(
  '/section/:sectionId',
  async (req: Request, res: Response) => {
    try {
      const { sectionId } = req.params

      if (!sectionId) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: { sectionId: 'REQUIRED' },
        })
      }

      const activities = await Activity.findAll({
        where: { sectionId },
        order: [['order', 'ASC']],
      })

      return res.json(activities)
    } catch (error) {
      return handleError(res, error)
    }
  }
)

// GET /activities/:id - Get one activity by id
activitiesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    if (!id) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: { id: 'REQUIRED' },
      })
    }

    const activity = await Activity.findByPk(id)

    if (!activity) {
      return res.status(404).json({ code: 'ACTIVITY_NOT_FOUND' })
    }

    return res.json(activity)
  } catch (error) {
    return handleError(res, error)
  }
})

// POST /activities - Create a new activity
activitiesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validation = validateDbActivityPayload(req.body)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const activity = await Activity.create(validation.data)

    return res.status(201).json(activity)
  } catch (error) {
    return handleError(res, error)
  }
})

// PUT /activities/:id - Update an activity
activitiesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    if (!id) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: { id: 'REQUIRED' },
      })
    }

    const validation = validateDbActivityPayload(req.body, true)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const [updated] = await Activity.update(validation.data, {
      where: { id },
    })

    if (!updated) {
      return res.status(404).json({ code: 'ACTIVITY_NOT_FOUND' })
    }

    const activity = await Activity.findByPk(id)
    return res.json(activity)
  } catch (error) {
    return handleError(res, error)
  }
})

// DELETE /activities/:id - Delete an activity
activitiesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    if (!id) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: { id: 'REQUIRED' },
      })
    }

    const deleted = await Activity.destroy({
      where: { id },
    })

    if (!deleted) {
      return res.status(404).json({ code: 'ACTIVITY_NOT_FOUND' })
    }

    return res.status(204).send()
  } catch (error) {
    return handleError(res, error)
  }
})
