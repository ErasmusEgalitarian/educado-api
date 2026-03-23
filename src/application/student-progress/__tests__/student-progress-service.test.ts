jest.mock('../../../config/database', () => ({
  sequelize: { define: jest.fn() },
}))

jest.mock('../../../models/index', () => ({
  Course: { findByPk: jest.fn() },
  Section: { findOne: jest.fn(), findAll: jest.fn(), count: jest.fn() },
  Enrollment: { findOne: jest.fn() },
  CourseProgress: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOrCreate: jest.fn(),
  },
  SectionProgress: {
    findOne: jest.fn(),
    findOrCreate: jest.fn(),
  },
  Certificate: { findOne: jest.fn(), create: jest.fn() },
  User: { findByPk: jest.fn() },
}))

import {
  getStudentCourseProgress,
  saveStudentSectionProgress,
  completeStudentCourse,
} from '../student-progress-service'
import { AppError } from '../../common/app-error'
import {
  Enrollment,
  Course,
  CourseProgress,
  SectionProgress,
  Section,
  Certificate,
} from '../../../models/index'

const MockEnrollment = Enrollment as unknown as { findOne: jest.Mock }
const MockCourse = Course as unknown as { findByPk: jest.Mock }
const MockCourseProgress = CourseProgress as unknown as {
  findOne: jest.Mock
  findOrCreate: jest.Mock
}
const MockSectionProgress = SectionProgress as unknown as {
  findOne: jest.Mock
  findOrCreate: jest.Mock
}
const MockSection = Section as unknown as {
  findOne: jest.Mock
  findAll: jest.Mock
  count: jest.Mock
}
const MockCertificate = Certificate as unknown as {
  findOne: jest.Mock
  create: jest.Mock
}

describe('getStudentCourseProgress', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should throw 404 when enrollment not found', async () => {
    MockEnrollment.findOne.mockResolvedValue(null)

    await expect(
      getStudentCourseProgress('user-1', 'course-1')
    ).rejects.toThrow(AppError)
  })

  it('should throw 404 when enrollment is DROPPED', async () => {
    MockEnrollment.findOne.mockResolvedValue({ status: 'DROPPED' })

    await expect(
      getStudentCourseProgress('user-1', 'course-1')
    ).rejects.toThrow(AppError)
  })

  it('should return progress with section statuses', async () => {
    MockEnrollment.findOne.mockResolvedValue({ status: 'ACTIVE' })

    const mockCourse = {
      id: 'course-1',
      get: jest.fn().mockReturnValue([
        {
          id: 'sec-1',
          title: 'Section 1',
          order: 1,
          duration: 300,
          videoMediaId: null,
        },
        {
          id: 'sec-2',
          title: 'Section 2',
          order: 2,
          duration: 600,
          videoMediaId: null,
        },
      ]),
    }
    MockCourse.findByPk.mockResolvedValue(mockCourse)

    const mockProgress = {
      courseId: 'course-1',
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      completedAt: null,
      get: jest
        .fn()
        .mockReturnValue([
          { sectionId: 'sec-1', completed: true, score: 80, totalQuestions: 5 },
        ]),
    }
    MockCourseProgress.findOne.mockResolvedValue(mockProgress)

    const result = await getStudentCourseProgress('user-1', 'course-1')

    expect(result.progressPercent).toBe(50)
    expect(result.sections).toHaveLength(2)
    expect(result.sections[0].status).toBe('completed')
    expect(result.sections[1].status).toBe('in_progress')
  })
})

describe('saveStudentSectionProgress', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should throw 404 when not enrolled', async () => {
    MockEnrollment.findOne.mockResolvedValue(null)

    await expect(
      saveStudentSectionProgress('user-1', 'course-1', 'sec-1', 80, 5)
    ).rejects.toThrow(AppError)
  })

  it('should throw 404 when section not found', async () => {
    MockEnrollment.findOne.mockResolvedValue({ status: 'ACTIVE' })
    MockSection.findOne.mockResolvedValue(null)

    await expect(
      saveStudentSectionProgress('user-1', 'course-1', 'sec-1', 80, 5)
    ).rejects.toThrow(AppError)
  })

  it('should throw 403 when section is locked', async () => {
    MockEnrollment.findOne.mockResolvedValue({ status: 'ACTIVE' })
    MockSection.findOne.mockResolvedValue({ id: 'sec-2', courseId: 'course-1' })
    MockSection.findAll.mockResolvedValue([
      { id: 'sec-1', order: 1 },
      { id: 'sec-2', order: 2 },
    ])
    MockCourseProgress.findOrCreate.mockResolvedValue([{ id: 'cp-1' }, false])
    MockSectionProgress.findOne.mockResolvedValue(null)

    await expect(
      saveStudentSectionProgress('user-1', 'course-1', 'sec-2', 80, 5)
    ).rejects.toThrow(AppError)

    try {
      await saveStudentSectionProgress('user-1', 'course-1', 'sec-2', 80, 5)
    } catch (error) {
      expect((error as AppError).payload.code).toBe('SECTION_LOCKED')
    }
  })

  it('should save progress for first section', async () => {
    MockEnrollment.findOne.mockResolvedValue({ status: 'ACTIVE' })
    MockSection.findOne.mockResolvedValue({ id: 'sec-1', courseId: 'course-1' })
    MockSection.findAll.mockResolvedValue([{ id: 'sec-1', order: 1 }])
    MockCourseProgress.findOrCreate.mockResolvedValue([
      { id: 'cp-1', update: jest.fn() },
      false,
    ])
    MockSectionProgress.findOrCreate.mockResolvedValue([
      { score: 80, completed: true },
      true,
    ])

    const result = await saveStudentSectionProgress(
      'user-1',
      'course-1',
      'sec-1',
      80,
      5
    )

    expect(result.completed).toBe(true)
    expect(result.score).toBe(80)
  })
})

describe('completeStudentCourse', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should throw 404 when not enrolled', async () => {
    MockEnrollment.findOne.mockResolvedValue(null)

    await expect(completeStudentCourse('user-1', 'course-1')).rejects.toThrow(
      AppError
    )
  })

  it('should throw 400 when sections are incomplete', async () => {
    MockEnrollment.findOne.mockResolvedValue({
      status: 'ACTIVE',
      update: jest.fn(),
    })

    const mockProgress = {
      completedAt: null,
      update: jest.fn(),
      get: jest.fn().mockReturnValue([{ completed: true }]),
    }
    MockCourseProgress.findOne.mockResolvedValue(mockProgress)
    MockSection.count.mockResolvedValue(3)

    await expect(completeStudentCourse('user-1', 'course-1')).rejects.toThrow(
      AppError
    )

    try {
      await completeStudentCourse('user-1', 'course-1')
    } catch (error) {
      expect((error as AppError).payload.code).toBe('SECTIONS_INCOMPLETE')
    }
  })

  it('should complete course and issue certificate', async () => {
    const mockEnrollment = { status: 'ACTIVE', update: jest.fn() }
    MockEnrollment.findOne.mockResolvedValue(mockEnrollment)

    const mockProgress = {
      completedAt: null,
      update: jest.fn(),
      get: jest
        .fn()
        .mockReturnValue([{ completed: true }, { completed: true }]),
    }
    MockCourseProgress.findOne.mockResolvedValue(mockProgress)
    MockSection.count.mockResolvedValue(2)
    MockCourse.findByPk.mockResolvedValue({
      id: 'course-1',
      title: 'Test Course',
    })
    MockCertificate.findOne.mockResolvedValue(null)

    const { User } = require('../../../models/index')
    User.findByPk = jest.fn().mockResolvedValue({
      firstName: 'João',
      lastName: 'Silva',
    })

    MockCertificate.create.mockResolvedValue({})

    const result = await completeStudentCourse('user-1', 'course-1')

    expect(result.progressPercent).toBe(100)
    expect(mockEnrollment.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'COMPLETED' })
    )
    expect(MockCertificate.create).toHaveBeenCalled()
  })
})
