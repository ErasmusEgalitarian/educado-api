import { Request, Response } from 'express'
import { CourseProgress, SectionProgress, Course } from '../../models'
import { requireParam } from '../../utils/request-params'

export const progressList = async (req: Request, res: Response) => {
  try {
    const deviceId = requireParam(req.params.deviceId)

    const progress = await CourseProgress.findAll({
      where: { deviceId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'imageUrl'],
        },
        {
          model: SectionProgress,
          as: 'sections',
        },
      ],
      order: [['lastAccessedAt', 'DESC']],
    })

    res.json(progress)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Missing required parameter')
    ) {
      return res.status(400).json({ error: error.message })
    }
    console.error('Error fetching course progress:', error)
    res.status(500).json({ error: 'Failed to fetch course progress' })
  }
}
