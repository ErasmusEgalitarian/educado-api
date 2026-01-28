import { Request, Response } from 'express'
import { Course, Section, Activity } from '../../models'
import { requireParam } from '../../utils/request-params'

export const coursesList = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.findAll({
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
      ],
    })
    res.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
}

export const coursesGet = async (req: Request, res: Response) => {
  try {
    const id = requireParam(req.params.id)

    const course = await Course.findByPk(id, {
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
      ],
    })

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    res.json(course)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Missing required parameter')
    ) {
      return res.status(400).json({ error: error.message })
    }
    console.error('Error fetching course:', error)
    res.status(500).json({ error: 'Failed to fetch course' })
  }
}
