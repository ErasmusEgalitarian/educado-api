import { FindOptions, Op, WhereOptions } from 'sequelize'
import { AppError } from '../common/app-error'
import { Course } from '../../models/course.model'

type AuthRole = 'ADMIN' | 'USER'

type AuthContext = {
  userId: string
  role: AuthRole
}

type CourseStatus = 'active' | 'inactive' | 'all'

export type CourseListFilters = {
  status?: CourseStatus
  category?: string
  difficulty?: string
  q?: string
}

const normalizeText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized ? normalized : undefined
}

export const parseCourseStatus = (statusParam: unknown): CourseStatus => {
  if (statusParam === 'active') return 'active'
  if (statusParam === 'inactive') return 'inactive'
  return 'all'
}

export const parseDifficulty = (
  difficultyParam: unknown
): 'beginner' | 'intermediate' | 'advanced' | undefined => {
  if (
    difficultyParam === 'beginner' ||
    difficultyParam === 'intermediate' ||
    difficultyParam === 'advanced'
  ) {
    return difficultyParam
  }

  return undefined
}

export const buildCourseWhereClause = (
  filters: CourseListFilters,
  ownerId?: string
): WhereOptions<Course> => {
  const where: WhereOptions<Course> = {}

  if (ownerId) {
    where.ownerId = ownerId
  }

  if (filters.status === 'active') {
    where.isActive = true
  } else if (filters.status === 'inactive') {
    where.isActive = false
  }

  const category = normalizeText(filters.category)
  if (category) {
    where.category = category
  }

  const difficulty = parseDifficulty(filters.difficulty)
  if (difficulty) {
    where.difficulty = difficulty
  }

  const query = normalizeText(filters.q)
  if (query) {
    const searchFilter = {
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { shortDescription: { [Op.iLike]: `%${query}%` } },
      ],
    } as WhereOptions<Course>

    Object.assign(where, searchFilter)
  }

  return where
}

export const findCourseByIdForActor = async (
  id: string,
  auth: AuthContext,
  options?: Omit<FindOptions<Course>, 'where'>
): Promise<Course> => {
  const course = await Course.findByPk(id, options)

  if (!course) {
    throw new AppError(404, { code: 'COURSE_NOT_FOUND' })
  }

  if (auth.role !== 'ADMIN' && course.ownerId !== auth.userId) {
    throw new AppError(403, { code: 'FORBIDDEN' })
  }

  return course
}

export const ensureAdmin = (auth: AuthContext): void => {
  if (auth.role !== 'ADMIN') {
    throw new AppError(403, { code: 'FORBIDDEN' })
  }
}
