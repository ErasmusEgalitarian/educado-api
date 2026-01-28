import { Request, Response } from 'express'
import { CourseProgress } from '../../models'
import { requireParam } from '../../utils/request-params'

export const progressComplete = async (req: Request, res: Response) => {
  try {
    const deviceId = requireParam(req.params.deviceId)
    const courseId = requireParam(req.params.courseId)

    const courseProgress = await CourseProgress.findOne({
      where: { deviceId, courseId },
    })

    if (!courseProgress) {
      return res.status(404).json({ error: 'Course progress not found' })
    }

    await courseProgress.update({
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    })

    res.json(courseProgress)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Missing required parameter')
    ) {
      return res.status(400).json({ error: error.message })
    }
    console.error('Error marking course complete:', error)
    res.status(500).json({ error: 'Failed to mark course complete' })
  }
}
