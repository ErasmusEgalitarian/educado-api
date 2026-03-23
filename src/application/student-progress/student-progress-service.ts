import { AppError } from '../common/app-error'
import { awardPoints } from '../gamification/gamification-service'
import {
  User,
  Course,
  Section,
  Enrollment,
  CourseProgress,
  SectionProgress,
  Certificate,
} from '../../models/index'

export const listStudentCourseProgress = async (userId: string) => {
  const progressRecords = await CourseProgress.findAll({
    where: { userId },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: [
          'id',
          'title',
          'shortDescription',
          'imageMediaId',
          'difficulty',
          'category',
        ],
      },
      {
        model: SectionProgress,
        as: 'sections',
      },
    ],
    order: [['lastAccessedAt', 'DESC']],
  })

  const results = []

  for (const progress of progressRecords) {
    const course = progress.get('course') as Course | null
    const sectionProgresses =
      (progress.get('sections') as SectionProgress[]) ?? []
    const completedSections = sectionProgresses.filter(
      (s) => s.completed
    ).length
    const totalSections = course
      ? await Section.count({ where: { courseId: course.id } })
      : 0
    const progressPercent =
      totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0

    results.push({
      courseId: progress.courseId,
      startedAt: progress.startedAt,
      lastAccessedAt: progress.lastAccessedAt,
      completedAt: progress.completedAt,
      progressPercent,
      completedSections,
      totalSections,
      course: course
        ? {
            id: course.id,
            title: course.title,
            shortDescription: course.shortDescription,
            imageMediaId: course.imageMediaId,
            difficulty: course.difficulty,
            category: course.category,
          }
        : null,
    })
  }

  return results
}

export const getStudentCourseProgress = async (
  userId: string,
  courseId: string
) => {
  const enrollment = await Enrollment.findOne({
    where: { userId, courseId },
  })

  if (!enrollment || enrollment.status === 'DROPPED') {
    throw new AppError(404, { code: 'ENROLLMENT_NOT_FOUND' })
  }

  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: Section,
        as: 'sections',
        attributes: ['id', 'title', 'order', 'duration', 'videoMediaId'],
        separate: true,
        order: [['order', 'ASC']],
      },
    ],
  })

  if (!course) {
    throw new AppError(404, { code: 'COURSE_NOT_FOUND' })
  }

  const courseProgress = await CourseProgress.findOne({
    where: { userId, courseId },
    include: [{ model: SectionProgress, as: 'sections' }],
  })

  const sectionProgressMap = new Map<
    string,
    { completed: boolean; score: number; totalQuestions: number }
  >()

  if (courseProgress) {
    for (const sp of (courseProgress.get('sections') as SectionProgress[]) ??
      []) {
      sectionProgressMap.set(sp.sectionId, {
        completed: sp.completed,
        score: sp.score,
        totalQuestions: sp.totalQuestions,
      })
    }
  }

  const courseSections = (course.get('sections') as Section[]) ?? []

  const sections = courseSections.map((section, index) => {
    const progress = sectionProgressMap.get(section.id)
    const prevSection = index > 0 ? courseSections[index - 1] : null
    const previousCompleted =
      index === 0 ||
      (prevSection
        ? sectionProgressMap.get(prevSection.id)?.completed === true
        : false)

    let status: 'completed' | 'in_progress' | 'locked'
    if (progress?.completed) {
      status = 'completed'
    } else if (previousCompleted) {
      status = 'in_progress'
    } else {
      status = 'locked'
    }

    return {
      id: section.id,
      title: section.title,
      order: section.order,
      duration: section.duration,
      videoMediaId: section.videoMediaId,
      status,
      score: progress?.score ?? null,
      totalQuestions: progress?.totalQuestions ?? null,
    }
  })

  const completedSections = sections.filter(
    (s) => s.status === 'completed'
  ).length
  const progressPercent =
    sections.length > 0
      ? Math.round((completedSections / sections.length) * 100)
      : 0

  return {
    courseId,
    startedAt: courseProgress?.startedAt ?? null,
    lastAccessedAt: courseProgress?.lastAccessedAt ?? null,
    completedAt: courseProgress?.completedAt ?? null,
    progressPercent,
    completedSections,
    totalSections: sections.length,
    sections,
  }
}

export const saveStudentSectionProgress = async (
  userId: string,
  courseId: string,
  sectionId: string,
  score: number,
  totalQuestions: number
) => {
  const enrollment = await Enrollment.findOne({
    where: { userId, courseId },
  })

  if (!enrollment || enrollment.status !== 'ACTIVE') {
    throw new AppError(404, { code: 'ENROLLMENT_NOT_FOUND' })
  }

  // Verify section belongs to course
  const section = await Section.findOne({
    where: { id: sectionId, courseId },
  })

  if (!section) {
    throw new AppError(404, { code: 'SECTION_NOT_FOUND' })
  }

  // Check sequential unlock
  const allSections = await Section.findAll({
    where: { courseId },
    order: [['order', 'ASC']],
  })

  const sectionIndex = allSections.findIndex((s) => s.id === sectionId)

  if (sectionIndex > 0) {
    const previousSection = allSections[sectionIndex - 1]
    const [courseProgress] = await CourseProgress.findOrCreate({
      where: { userId, courseId },
      defaults: {
        userId,
        courseId,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      },
    })

    const prevSectionProgress = await SectionProgress.findOne({
      where: {
        courseProgressId: courseProgress.id,
        sectionId: previousSection.id,
      },
    })

    if (!prevSectionProgress || !prevSectionProgress.completed) {
      throw new AppError(403, { code: 'SECTION_LOCKED' })
    }
  }

  // Get or create course progress
  const [courseProgress] = await CourseProgress.findOrCreate({
    where: { userId, courseId },
    defaults: {
      userId,
      courseId,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
    },
  })

  await courseProgress.update({ lastAccessedAt: new Date() })

  // Get or create section progress, retain best score
  const [sectionProgress, created] = await SectionProgress.findOrCreate({
    where: {
      courseProgressId: courseProgress.id,
      sectionId,
    },
    defaults: {
      courseProgressId: courseProgress.id,
      sectionId,
      completed: true,
      score,
      totalQuestions,
      completedAt: new Date(),
    },
  })

  if (!created) {
    const bestScore = Math.max(sectionProgress.score, score)
    await sectionProgress.update({
      completed: true,
      score: bestScore,
      totalQuestions,
      completedAt: sectionProgress.completedAt ?? new Date(),
    })
  }

  // Award gamification points on first completion
  if (created) {
    try {
      await awardPoints(userId, 'SECTION_COMPLETE', courseId)
      if (totalQuestions > 0 && score === totalQuestions) {
        await awardPoints(userId, 'PERFECT_SCORE', courseId)
      }
    } catch {
      // Non-critical — don't fail the request
    }
  }

  return {
    sectionId,
    completed: true,
    score: created ? score : Math.max(sectionProgress.score, score),
    totalQuestions,
  }
}

export const completeStudentCourse = async (
  userId: string,
  courseId: string
) => {
  const enrollment = await Enrollment.findOne({
    where: { userId, courseId },
  })

  if (!enrollment || enrollment.status !== 'ACTIVE') {
    throw new AppError(404, { code: 'ENROLLMENT_NOT_FOUND' })
  }

  const courseProgress = await CourseProgress.findOne({
    where: { userId, courseId },
    include: [{ model: SectionProgress, as: 'sections' }],
  })

  if (!courseProgress) {
    throw new AppError(400, { code: 'NO_PROGRESS' })
  }

  // Verify all sections are completed
  const totalSections = await Section.count({ where: { courseId } })
  const completedSections = (
    (courseProgress.get('sections') as SectionProgress[]) ?? []
  ).filter((s) => s.completed).length

  if (completedSections < totalSections) {
    throw new AppError(400, { code: 'SECTIONS_INCOMPLETE' })
  }

  const now = new Date()
  await courseProgress.update({ completedAt: now, lastAccessedAt: now })
  await enrollment.update({ status: 'COMPLETED', completedAt: now })

  // Issue certificate
  const course = await Course.findByPk(courseId)
  if (course) {
    const existingCert = await Certificate.findOne({
      where: { userId, courseId },
    })

    if (!existingCert) {
      const user = await User.findByPk(userId)

      await Certificate.create({
        courseId,
        userId,
        courseName: course.title,
        userName: user
          ? `${user.firstName} ${user.lastName}`.trim()
          : 'Estudante',
        totalSections,
        completedAt: now,
      })
    }
  }

  // Award gamification points for course completion
  try {
    await awardPoints(userId, 'COURSE_COMPLETE', courseId)
  } catch {
    // Non-critical — don't fail the request
  }

  return {
    courseId,
    completedAt: now,
    progressPercent: 100,
  }
}
