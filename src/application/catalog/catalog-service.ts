import { Op, fn, col, literal } from 'sequelize'
import { Course, Section, Activity, Tag, Enrollment } from '../../models/index'
import { AppError } from '../common/app-error'
import { parseDifficulty } from '../courses/course-access-service'

export type CatalogFilters = {
  q?: string
  category?: string
  difficulty?: string
  page?: number
  limit?: number
}

export const listPublicCourses = async (filters: CatalogFilters) => {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20))
  const offset = (page - 1) * limit

  const where: Record<string, unknown> = { isActive: true }

  if (filters.category) {
    where.category = filters.category
  }

  const difficulty = parseDifficulty(filters.difficulty)
  if (difficulty) {
    where.difficulty = difficulty
  }

  if (filters.q) {
    const query = filters.q.trim()
    if (query) {
      Object.assign(where, {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { shortDescription: { [Op.iLike]: `%${query}%` } },
        ],
      })
    }
  }

  const { rows: courses, count: total } = await Course.findAndCountAll({
    where,
    attributes: {
      include: [
        [
          literal(
            '(SELECT COUNT(*) FROM enrollments WHERE enrollments."courseId" = course.id AND enrollments.status = \'ACTIVE\')'
          ),
          'enrollmentCount',
        ],
      ],
    },
    include: [
      {
        model: Tag,
        as: 'reusableTags',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] },
      },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
    distinct: true,
  })

  return {
    items: courses.map((course) => ({
      id: course.id,
      title: course.title,
      shortDescription: course.shortDescription,
      imageMediaId: course.imageMediaId,
      difficulty: course.difficulty,
      estimatedTime: course.estimatedTime,
      category: course.category,
      rating: course.rating,
      tags: course.tags,
      reusableTags: (course.get('reusableTags') as Tag[]) ?? [],
      enrollmentCount: Number((course.get('enrollmentCount') as string) ?? '0'),
    })),
    page,
    limit,
    total,
  }
}

export const getPublicCourseDetail = async (courseId: string) => {
  const course = await Course.findOne({
    where: { id: courseId, isActive: true },
    include: [
      {
        model: Section,
        as: 'sections',
        attributes: [
          'id',
          'title',
          'order',
          'duration',
          'thumbnailMediaId',
          'videoMediaId',
        ],
        include: [
          {
            model: Activity,
            as: 'activities',
            attributes: [
              'id',
              'sectionId',
              'title',
              'type',
              'order',
              'pauseTimestamp',
              'textPages',
              'question',
              'imageMediaId',
              'options',
              'correctAnswer',
              'icon',
            ],
            separate: true,
            order: [['order', 'ASC']],
          },
        ],
        separate: true,
        order: [['order', 'ASC']],
      },
      {
        model: Tag,
        as: 'reusableTags',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] },
      },
    ],
  })

  if (!course) {
    throw new AppError(404, { code: 'COURSE_NOT_FOUND' })
  }

  const enrollmentCount = await Enrollment.count({
    where: { courseId, status: 'ACTIVE' },
  })

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    shortDescription: course.shortDescription,
    imageMediaId: course.imageMediaId,
    difficulty: course.difficulty,
    estimatedTime: course.estimatedTime,
    passingThreshold: course.passingThreshold,
    category: course.category,
    rating: course.rating,
    tags: course.tags,
    reusableTags: (course.get('reusableTags') as Tag[]) ?? [],
    sections: ((course.get('sections') as Section[]) ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order,
      duration: s.duration,
      thumbnailMediaId: s.thumbnailMediaId,
      videoMediaId: s.videoMediaId,
      activities: (s.get('activities') as Activity[]) ?? [],
    })),
    enrollmentCount,
  }
}

export const listPublicCategories = async () => {
  const categories = await Course.findAll({
    where: { isActive: true },
    attributes: [[fn('DISTINCT', col('category')), 'category']],
    order: [[col('category'), 'ASC']],
    raw: true,
  })

  return categories
    .map((c) => (c as unknown as { category: string }).category)
    .filter(Boolean)
}
