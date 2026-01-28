import { Request, Response } from 'express'
import { CourseProgress, SectionProgress } from '../../models'
import { requireParam } from '../../utils/request-params'

export const progressSaveSection = async (req: Request, res: Response) => {
  try {
    const deviceId = requireParam(req.params.deviceId)
    const courseId = requireParam(req.params.courseId)
    const sectionId = requireParam(req.params.sectionId)
    const { score, totalQuestions } = req.body

    if (score === undefined || totalQuestions === undefined) {
      return res
        .status(400)
        .json({ error: 'Score and totalQuestions are required' })
    }

    // Find or create course progress
    let courseProgress = await CourseProgress.findOne({
      where: { deviceId, courseId },
    })

    const now = new Date()

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseId,
        deviceId,
        startedAt: now,
        lastAccessedAt: now,
      })
    } else {
      await courseProgress.update({ lastAccessedAt: now })
    }

    // Find or create section progress
    const [sectionProgress, created] = await SectionProgress.findOrCreate({
      where: {
        courseProgressId: courseProgress.id,
        sectionId,
      },
      defaults: {
        completed: true,
        score,
        totalQuestions,
        completedAt: now,
      },
    })

    if (!created) {
      await sectionProgress.update({
        completed: true,
        score,
        totalQuestions,
        completedAt: now,
      })
    }

    res.json(sectionProgress)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Missing required parameter')
    ) {
      return res.status(400).json({ error: error.message })
    }
    console.error('Error saving section progress:', error)
    res.status(500).json({ error: 'Failed to save section progress' })
  }
}
