jest.mock('../../../models/course.model', () => ({
  Course: {
    findByPk: jest.fn(),
  },
}))

import { AppError } from '../../common/app-error'
import { Course } from '../../../models/course.model'
import {
  findCourseByIdForActor,
  ensureAdmin,
  buildCourseWhereClause,
  parseCourseStatus,
  parseDifficulty,
} from '../course-access-service'

describe('findCourseByIdForActor', () => {
  it('should return course when user is ADMIN', async () => {
    const course = { id: 'c-1', ownerId: 'other-user' }
    ;(Course.findByPk as jest.Mock).mockResolvedValue(course)

    const result = await findCourseByIdForActor('c-1', {
      userId: 'admin-1',
      role: 'ADMIN',
    })
    expect(result).toBe(course)
  })

  it('should return course when USER owns it', async () => {
    const course = { id: 'c-1', ownerId: 'user-1' }
    ;(Course.findByPk as jest.Mock).mockResolvedValue(course)

    const result = await findCourseByIdForActor('c-1', {
      userId: 'user-1',
      role: 'USER',
    })
    expect(result).toBe(course)
  })

  it('should throw COURSE_NOT_FOUND when course does not exist', async () => {
    ;(Course.findByPk as jest.Mock).mockResolvedValue(null)

    try {
      await findCourseByIdForActor('nonexistent', {
        userId: 'user-1',
        role: 'USER',
      })
    } catch (e) {
      expect(e).toBeInstanceOf(AppError)
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('COURSE_NOT_FOUND')
    }
  })

  it('should throw FORBIDDEN when USER does not own the course', async () => {
    const course = { id: 'c-1', ownerId: 'other-user' }
    ;(Course.findByPk as jest.Mock).mockResolvedValue(course)

    try {
      await findCourseByIdForActor('c-1', {
        userId: 'user-1',
        role: 'USER',
      })
    } catch (e) {
      expect(e).toBeInstanceOf(AppError)
      expect((e as AppError).statusCode).toBe(403)
      expect((e as AppError).payload.code).toBe('FORBIDDEN')
    }
  })
})

describe('ensureAdmin', () => {
  it('should not throw for ADMIN role', () => {
    expect(() => ensureAdmin({ userId: 'a', role: 'ADMIN' })).not.toThrow()
  })

  it('should throw FORBIDDEN for USER role', () => {
    expect(() => ensureAdmin({ userId: 'u', role: 'USER' })).toThrow(AppError)
    try {
      ensureAdmin({ userId: 'u', role: 'USER' })
    } catch (e) {
      expect((e as AppError).statusCode).toBe(403)
    }
  })
})

describe('buildCourseWhereClause', () => {
  it('should return empty where clause with no filters', () => {
    const where = buildCourseWhereClause({})
    expect(where).toEqual({})
  })

  it('should add ownerId when provided', () => {
    const where = buildCourseWhereClause({}, 'user-1')
    expect(where).toHaveProperty('ownerId', 'user-1')
  })

  it('should set isActive true for status=active', () => {
    const where = buildCourseWhereClause({ status: 'active' })
    expect(where).toHaveProperty('isActive', true)
  })

  it('should set isActive false for status=inactive', () => {
    const where = buildCourseWhereClause({ status: 'inactive' })
    expect(where).toHaveProperty('isActive', false)
  })

  it('should not set isActive for status=all', () => {
    const where = buildCourseWhereClause({ status: 'all' })
    expect(where).not.toHaveProperty('isActive')
  })

  it('should add category filter', () => {
    const where = buildCourseWhereClause({ category: 'Math' })
    expect(where).toHaveProperty('category', 'Math')
  })

  it('should add difficulty filter', () => {
    const where = buildCourseWhereClause({ difficulty: 'beginner' })
    expect(where).toHaveProperty('difficulty', 'beginner')
  })

  it('should ignore invalid difficulty', () => {
    const where = buildCourseWhereClause({ difficulty: 'expert' })
    expect(where).not.toHaveProperty('difficulty')
  })
})

describe('parseCourseStatus', () => {
  it('should return active for "active"', () => {
    expect(parseCourseStatus('active')).toBe('active')
  })

  it('should return inactive for "inactive"', () => {
    expect(parseCourseStatus('inactive')).toBe('inactive')
  })

  it('should return all for anything else', () => {
    expect(parseCourseStatus('unknown')).toBe('all')
    expect(parseCourseStatus(undefined)).toBe('all')
  })
})

describe('parseDifficulty', () => {
  it('should return valid difficulty values', () => {
    expect(parseDifficulty('beginner')).toBe('beginner')
    expect(parseDifficulty('intermediate')).toBe('intermediate')
    expect(parseDifficulty('advanced')).toBe('advanced')
  })

  it('should return undefined for invalid values', () => {
    expect(parseDifficulty('expert')).toBeUndefined()
    expect(parseDifficulty(undefined)).toBeUndefined()
  })
})
