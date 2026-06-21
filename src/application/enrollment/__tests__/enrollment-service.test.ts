jest.mock('../../../config/database', () => ({
  sequelize: {
    define: jest.fn(),
    transaction: jest.fn((fn: (t: unknown) => Promise<unknown>) =>
      fn({ LOCK: {} })
    ),
  },
}))

jest.mock('../../../models/index', () => ({
  Course: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
  Enrollment: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  CourseProgress: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findOrCreate: jest.fn(),
    destroy: jest.fn(),
  },
  SectionProgress: {
    destroy: jest.fn(),
  },
  Section: {
    count: jest.fn(),
  },
  PointsLedger: {
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  StudentStats: {
    findOne: jest.fn(),
  },
  Certificate: {
    destroy: jest.fn(),
  },
  CourseReview: {
    findOne: jest.fn(),
    destroy: jest.fn(),
  },
  Tag: {},
  CourseTag: {},
}))

import { enrollStudent, dropEnrollment } from '../enrollment-service'
import { AppError } from '../../common/app-error'
import {
  Course,
  Enrollment,
  CourseProgress,
  PointsLedger,
} from '../../../models/index'

const MockCourse = Course as unknown as {
  findOne: jest.Mock
  findByPk: jest.Mock
}
const MockEnrollment = Enrollment as unknown as {
  findOne: jest.Mock
  findAll: jest.Mock
  create: jest.Mock
}
const MockCourseProgress = CourseProgress as unknown as {
  findOrCreate: jest.Mock
  findAll: jest.Mock
  findOne: jest.Mock
}
const MockPointsLedger = PointsLedger as unknown as {
  findAll: jest.Mock
}

describe('enrollStudent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create enrollment and course progress', async () => {
    MockCourse.findOne.mockResolvedValue({ id: 'course-1', isActive: true })
    MockEnrollment.findOne.mockResolvedValue(null)
    MockEnrollment.create.mockResolvedValue({
      id: 'enrollment-1',
      courseId: 'course-1',
      enrolledAt: new Date(),
    })
    MockCourseProgress.findOrCreate.mockResolvedValue([{}, true])

    const result = await enrollStudent('user-1', 'course-1')

    expect(result.status).toBe('ACTIVE')
    expect(result.courseId).toBe('course-1')
    expect(MockEnrollment.create).toHaveBeenCalled()
    expect(MockCourseProgress.findOrCreate).toHaveBeenCalled()
  })

  it('should throw 404 when course not found', async () => {
    MockCourse.findOne.mockResolvedValue(null)

    await expect(enrollStudent('user-1', 'bad-id')).rejects.toThrow(AppError)

    try {
      await enrollStudent('user-1', 'bad-id')
    } catch (error) {
      expect((error as AppError).statusCode).toBe(404)
    }
  })

  it('should throw 409 when already enrolled', async () => {
    MockCourse.findOne.mockResolvedValue({ id: 'course-1', isActive: true })
    MockEnrollment.findOne.mockResolvedValue({
      id: 'enrollment-1',
      status: 'ACTIVE',
    })

    await expect(enrollStudent('user-1', 'course-1')).rejects.toThrow(AppError)

    try {
      await enrollStudent('user-1', 'course-1')
    } catch (error) {
      expect((error as AppError).statusCode).toBe(409)
      expect((error as AppError).payload.code).toBe('ALREADY_ENROLLED')
    }
  })

  it('should re-activate a dropped enrollment', async () => {
    MockCourse.findOne.mockResolvedValue({ id: 'course-1', isActive: true })
    MockEnrollment.findOne.mockResolvedValue({
      id: 'enrollment-1',
      status: 'DROPPED',
      enrolledAt: new Date(),
      update: jest.fn(),
    })

    const result = await enrollStudent('user-1', 'course-1')

    expect(result.status).toBe('ACTIVE')
  })
})

describe('dropEnrollment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set enrollment status to DROPPED', async () => {
    const mockEnrollment = {
      id: 'enrollment-1',
      status: 'ACTIVE',
      update: jest.fn(),
    }
    MockEnrollment.findOne.mockResolvedValue(mockEnrollment)
    MockPointsLedger.findAll.mockResolvedValue([])
    MockCourseProgress.findOne.mockResolvedValue(null)

    const result = await dropEnrollment('user-1', 'course-1')

    expect(result.status).toBe('DROPPED')
    expect(mockEnrollment.update).toHaveBeenCalledWith(
      { status: 'DROPPED' },
      { transaction: { LOCK: {} } }
    )
  })

  it('should throw 404 when enrollment not found', async () => {
    MockEnrollment.findOne.mockResolvedValue(null)

    await expect(dropEnrollment('user-1', 'bad-id')).rejects.toThrow(AppError)
  })

  it('should throw 409 when already dropped', async () => {
    MockEnrollment.findOne.mockResolvedValue({
      id: 'enrollment-1',
      status: 'DROPPED',
    })

    await expect(dropEnrollment('user-1', 'course-1')).rejects.toThrow(AppError)

    try {
      await dropEnrollment('user-1', 'course-1')
    } catch (error) {
      expect((error as AppError).payload.code).toBe('ALREADY_DROPPED')
    }
  })
})
