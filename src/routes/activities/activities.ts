import { Router } from 'express'
import { Request, Response } from 'express'
import { Activity } from '../../models/activity.model'

export const activitiesRouter = Router()

// GET /activities/section/:sectionId - Get all activities for a section
activitiesRouter.get('/section/:sectionId', async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params
    const activities = await Activity.findAll({
      where: { sectionId },
      order: [['order', 'ASC']]
    })
    res.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

// POST /activities - Create a new activity
activitiesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const activityData = req.body

    if (!activityData.id) {
      return res.status(400).json({ error: 'Activity ID is required' })
    }

    const activity = await Activity.create(activityData)
    res.status(201).json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    res.status(500).json({ error: 'Failed to create activity' })
  }
})

// PUT /activities/:id - Update an activity
activitiesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const [updated] = await Activity.update(req.body, {
      where: { id }
    })

    if (!updated) {
      return res.status(404).json({ error: 'Activity not found' })
    }

    const activity = await Activity.findByPk(id)
    res.json(activity)
  } catch (error) {
    console.error('Error updating activity:', error)
    res.status(500).json({ error: 'Failed to update activity' })
  }
})

// DELETE /activities/:id - Delete an activity
activitiesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const deleted = await Activity.destroy({
      where: { id }
    })

    if (!deleted) {
      return res.status(404).json({ error: 'Activity not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting activity:', error)
    res.status(500).json({ error: 'Failed to delete activity' })
  }
})