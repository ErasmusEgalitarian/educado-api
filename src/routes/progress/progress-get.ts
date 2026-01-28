import { Request, Response } from 'express'
import { CourseProgress, SectionProgress, Course, Section } from '../../models'
import { requireParam } from '../../utils/request-params'

export const progressGet = async (req: Request, res: Response) => {
  try {
    const deviceId = requireParam(req.params.deviceId)
    const courseId = requireParam(req.params.courseId)

    const progress = await CourseProgress.findOne({
      where: { deviceId, courseId },
      include: [
        {
          model: Course,
          as: 'course',
        },
        {
          model: SectionProgress,
          as: 'sections',
          include: [
            {
              model: Section,
              as: 'section',
              attributes: ['id', 'title'],
            },
          ],
        },
      ],
    })

    if (!progress) {
      return res.status(404).json({ error: 'Course progress not found' })
    }

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
