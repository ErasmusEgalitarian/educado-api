import { Request, Response } from 'express'
import { CourseProgress, SectionProgress, User } from '../../models'
import { requireParam } from '../../utils/request-params'

export const progressSaveSection = async (req: Request, res: Response) => {
  try {
    const username = requireParam(req.params.username)
    const courseId = requireParam(req.params.courseId)
    const sectionId = requireParam(req.params.sectionId)
    const { score, totalQuestions } = req.body

    if (score === undefined || totalQuestions === undefined) {
      return res
        .status(400)
        .json({ error: 'Score and totalQuestions are required' })
    }

    // Find user by username
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Find or create course progress
    let courseProgress = await CourseProgress.findOne({
      where: { userId: user.id, courseId },
    })

    const now = new Date()

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseId,
        userId: user.id,
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
