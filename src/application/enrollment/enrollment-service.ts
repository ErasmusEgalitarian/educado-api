import { AppError } from '../common/app-error'
import {
  Course,
  Enrollment,
  CourseProgress,
  SectionProgress,
  Section,
} from '../../models/index'
import { sequelize } from '../../config/database'

export const enrollStudent = async (userId: string, courseId: string) => {
  return sequelize.transaction(async (transaction) => {
    const course = await Course.findOne({
      where: { id: courseId, isActive: true },
      transaction,
    })

    if (!course) {
      throw new AppError(404, { code: 'COURSE_NOT_FOUND' })
    }

    const existing = await Enrollment.findOne({
      where: { userId, courseId },
      transaction,
    })

    if (existing) {
      if (existing.status === 'DROPPED') {
        await existing.update(
          { status: 'ACTIVE', enrolledAt: new Date() },
          { transaction }
        )
        return {
          id: existing.id,
          courseId,
          status: 'ACTIVE' as const,
          enrolledAt: existing.enrolledAt,
        }
      }
      throw new AppError(409, { code: 'ALREADY_ENROLLED' })
    }

    const enrollment = await Enrollment.create(
      {
        userId,
        courseId,
        enrolledAt: new Date(),
        status: 'ACTIVE',
      },
      { transaction }
    )

    // Create initial course progress
    await CourseProgress.findOrCreate({
      where: { userId, courseId },
      defaults: {
        userId,
        courseId,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      },
      transaction,
    })

    return {
      id: enrollment.id,
      courseId,
      status: 'ACTIVE' as const,
      enrolledAt: enrollment.enrolledAt,
    }
  })
}

export const listStudentEnrollments = async (userId: string) => {
  const enrollments = await Enrollment.findAll({
    where: { userId, status: ['ACTIVE', 'COMPLETED'] },
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
          'estimatedTime',
          'category',
          'rating',
        ],
      },
    ],
    order: [['updatedAt', 'DESC']],
  })

  // Get progress for each enrollment
  const progressRecords = await CourseProgress.findAll({
    where: { userId },
    include: [
      {
        model: SectionProgress,
        as: 'sections',
      },
    ],
  })

  const progressMap = new Map<
    string,
    { completedSections: number; totalSections: number }
  >()

  for (const progress of progressRecords) {
    const courseId = progress.courseId
    const sections = (progress.get('sections') as SectionProgress[]) ?? []
    const completedSections = sections.filter((s) => s.completed).length

    // Get total sections for the course
    const totalSections = await Section.count({ where: { courseId } })

    progressMap.set(courseId, { completedSections, totalSections })
  }

  return enrollments.map((enrollment) => {
    const course = enrollment.get('course') as Course
    const progress = progressMap.get(enrollment.courseId)
    const completedSections = progress?.completedSections ?? 0
    const totalSections = progress?.totalSections ?? 0
    const progressPercent =
      totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0

    return {
      id: enrollment.id,
      courseId: enrollment.courseId,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
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
            estimatedTime: course.estimatedTime,
            category: course.category,
            rating: course.rating,
          }
        : null,
    }
  })
}

export const getEnrollmentDetail = async (userId: string, courseId: string) => {
  const enrollment = await Enrollment.findOne({
    where: { userId, courseId },
  })

  if (!enrollment) {
    throw new AppError(404, { code: 'ENROLLMENT_NOT_FOUND' })
  }

  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: Section,
        as: 'sections',
        attributes: [
          'id',
          'title',
          'order',
          'duration',
          'videoMediaId',
          'thumbnailMediaId',
        ],
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
    include: [
      {
        model: SectionProgress,
        as: 'sections',
      },
    ],
  })

  const sectionProgressMap = new Map<
    string,
    { completed: boolean; score: number; totalQuestions: number }
  >()

  if (courseProgress) {
    const sectionProgresses =
      (courseProgress.get('sections') as SectionProgress[]) ?? []
    for (const sp of sectionProgresses) {
      sectionProgressMap.set(sp.sectionId, {
        completed: sp.completed,
        score: sp.score,
        totalQuestions: sp.totalQuestions,
      })
    }
  }

  const sections = ((course.get('sections') as Section[]) ?? []).map(
    (section, index) => {
      const progress = sectionProgressMap.get(section.id)
      const previousCompleted =
        index === 0 ||
        sectionProgressMap.get(
          ((course.get('sections') as Section[]) ?? [])[index - 1]?.id
        )?.completed === true

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
        thumbnailMediaId: section.thumbnailMediaId,
        status,
        score: progress?.score ?? null,
        totalQuestions: progress?.totalQuestions ?? null,
      }
    }
  )

  const completedSections = sections.filter(
    (s) => s.status === 'completed'
  ).length
  const progressPercent =
    sections.length > 0
      ? Math.round((completedSections / sections.length) * 100)
      : 0

  return {
    enrollment: {
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
    },
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      imageMediaId: course.imageMediaId,
      difficulty: course.difficulty,
      estimatedTime: course.estimatedTime,
      passingThreshold: course.passingThreshold,
    },
    progressPercent,
    completedSections,
    totalSections: sections.length,
    sections,
  }
}

export const dropEnrollment = async (userId: string, courseId: string) => {
  const enrollment = await Enrollment.findOne({
    where: { userId, courseId },
  })

  if (!enrollment) {
    throw new AppError(404, { code: 'ENROLLMENT_NOT_FOUND' })
  }

  if (enrollment.status === 'DROPPED') {
    throw new AppError(409, { code: 'ALREADY_DROPPED' })
  }

  await enrollment.update({ status: 'DROPPED' })

  return { status: 'DROPPED' as const }
}
