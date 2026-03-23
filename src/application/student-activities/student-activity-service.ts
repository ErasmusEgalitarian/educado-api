import { AppError } from '../common/app-error'
import {
  Activity,
  Section,
  Enrollment,
  CourseProgress,
  SectionProgress,
  ActivityProgress,
} from '../../models/index'

export const submitAnswer = async (
  userId: string,
  activityId: string,
  answer: unknown
) => {
  const activity = await Activity.findByPk(activityId, {
    include: [
      {
        model: Section,
        as: 'section',
        attributes: ['id', 'courseId'],
      },
    ],
  })

  if (!activity) {
    throw new AppError(404, { code: 'ACTIVITY_NOT_FOUND' })
  }

  const section = activity.get('section') as Section | null
  if (!section) {
    throw new AppError(404, { code: 'SECTION_NOT_FOUND' })
  }

  const courseId = section.courseId

  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    where: { userId, courseId, status: 'ACTIVE' },
  })

  if (!enrollment) {
    throw new AppError(403, { code: 'NOT_ENROLLED' })
  }

  // Determine correctness based on activity type
  let isCorrect = false
  const correctAnswer = activity.correctAnswer

  if (activity.type === 'true_false') {
    isCorrect = answer === correctAnswer
  } else if (activity.type === 'multiple_choice') {
    isCorrect = answer === correctAnswer
  } else if (activity.type === 'video_pause') {
    isCorrect = answer === correctAnswer
  } else {
    // text_reading — no correct answer, always "correct"
    isCorrect = true
  }

  // Get or create section progress
  const courseProgress = await CourseProgress.findOne({
    where: { userId, courseId },
  })

  if (!courseProgress) {
    throw new AppError(400, { code: 'NO_PROGRESS' })
  }

  const [sectionProgress] = await SectionProgress.findOrCreate({
    where: {
      courseProgressId: courseProgress.id,
      sectionId: section.id,
    },
    defaults: {
      courseProgressId: courseProgress.id,
      sectionId: section.id,
      completed: false,
      score: 0,
      totalQuestions: 0,
    },
  })

  // Find or create activity progress
  const [activityProgress, created] = await ActivityProgress.findOrCreate({
    where: { userId, activityId },
    defaults: {
      userId,
      activityId,
      sectionProgressId: sectionProgress.id,
      answer,
      isCorrect,
      attempts: 1,
      bestScore: isCorrect ? 1 : 0,
    },
  })

  if (!created) {
    const newBestScore = Math.max(activityProgress.bestScore, isCorrect ? 1 : 0)
    await activityProgress.update({
      answer,
      isCorrect,
      attempts: activityProgress.attempts + 1,
      bestScore: newBestScore,
    })
  }

  return {
    activityId,
    correct: isCorrect,
    correctAnswer: activity.correctAnswer,
    attempts: created ? 1 : activityProgress.attempts + 1,
  }
}
