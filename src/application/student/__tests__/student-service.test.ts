jest.mock('../../../config/database', () => ({
  sequelize: {
    define: jest.fn(),
    transaction: jest.fn((fn: (t: unknown) => Promise<unknown>) =>
      fn({ LOCK: {} })
    ),
  },
}))
jest.mock('../../../infrastructure/security/password-hasher', () => ({
  hashPassword: jest.fn(() => Promise.resolve('hashed-password')),
}))
jest.mock('../../../config/jwt', () => ({
  getAccessTokenSecret: jest.fn(() => 'test-secret'),
}))

// Mock all models via the index barrel
jest.mock('../../../models/index', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  CourseProgress: {
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  SectionProgress: {
    destroy: jest.fn(),
  },
  Certificate: {
    destroy: jest.fn(),
  },
}))

import {
  registerStudent,
  loginByDevice,
  getStudentProfile,
  updateStudentProfile,
  deleteStudentAccount,
} from '../student-service'
import { AppError } from '../../common/app-error'
import { User } from '../../../models/index'

const MockUser = User as unknown as {
  create: jest.Mock
  findOne: jest.Mock
  findByPk: jest.Mock
}

describe('registerStudent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a student user and return accessToken', async () => {
    const mockUser = {
      id: 'student-uuid-1',
      firstName: 'João',
      lastName: 'Silva',
    }

    MockUser.create.mockResolvedValue(mockUser)

    const result = await registerStudent({
      firstName: 'João',
      lastName: 'Silva',
    })

    expect(result.accessToken).toBeDefined()
    expect(result.user.id).toBe('student-uuid-1')
    expect(result.user.firstName).toBe('João')

    const createCall = MockUser.create.mock.calls[0][0]
    expect(createCall.role).toBe('STUDENT')
    expect(createCall.status).toBe('APPROVED')
    expect(createCall.firstName).toBe('João')
    expect(createCall.lastName).toBe('Silva')
  })

  it('should pass optional fields to User.create', async () => {
    const mockUser = {
      id: 'student-uuid-2',
      firstName: 'Maria',
      lastName: 'Santos',
    }

    MockUser.create.mockResolvedValue(mockUser)

    await registerStudent({
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria@test.com',
      phone: '11999998888',
      dateOfBirth: '1995-03-20',
      deviceId: 'device-123',
    })

    const createCall = MockUser.create.mock.calls[0][0]
    expect(createCall.email).toBe('maria@test.com')
    expect(createCall.phone).toBe('11999998888')
    expect(createCall.dateOfBirth).toBe('1995-03-20')
    expect(createCall.deviceId).toBe('device-123')
  })
})

describe('loginByDevice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return accessToken when device is found', async () => {
    const mockUser = {
      id: 'student-uuid-1',
      firstName: 'João',
      lastName: 'Silva',
      update: jest.fn(),
    }

    MockUser.findOne.mockResolvedValue(mockUser)

    const result = await loginByDevice('device-abc')

    expect(result.accessToken).toBeDefined()
    expect(result.user.id).toBe('student-uuid-1')
    expect(mockUser.update).toHaveBeenCalledWith({
      lastLoginAt: expect.any(Date),
    })
  })

  it('should throw 404 when device is not found', async () => {
    MockUser.findOne.mockResolvedValue(null)

    await expect(loginByDevice('unknown-device')).rejects.toThrow(AppError)

    try {
      await loginByDevice('unknown-device')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).statusCode).toBe(404)
      expect((error as AppError).payload.code).toBe('DEVICE_NOT_FOUND')
    }
  })
})

describe('getStudentProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return profile data', async () => {
    const mockUser = {
      id: 'student-uuid-1',
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@test.com',
      phone: '11999998888',
      dateOfBirth: '1990-01-15',
      avatarMediaId: null,
      deviceId: 'device-123',
      createdAt: new Date('2024-01-01'),
    }

    MockUser.findByPk.mockResolvedValue(mockUser)

    const result = await getStudentProfile('student-uuid-1')

    expect(result.id).toBe('student-uuid-1')
    expect(result.firstName).toBe('João')
    expect(result.email).toBe('joao@test.com')
  })

  it('should return null email for auto-generated local emails', async () => {
    const mockUser = {
      id: 'student-uuid-1',
      firstName: 'João',
      lastName: 'Silva',
      email: 'student-abc123@local',
      phone: null,
      dateOfBirth: null,
      avatarMediaId: null,
      deviceId: null,
      createdAt: new Date(),
    }

    MockUser.findByPk.mockResolvedValue(mockUser)

    const result = await getStudentProfile('student-uuid-1')
    expect(result.email).toBeNull()
  })

  it('should throw 404 when user not found', async () => {
    MockUser.findByPk.mockResolvedValue(null)

    await expect(getStudentProfile('unknown')).rejects.toThrow(AppError)
  })
})

describe('updateStudentProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update and return profile', async () => {
    const mockUser = {
      id: 'student-uuid-1',
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@test.com',
      phone: null,
      dateOfBirth: null,
      avatarMediaId: null,
      deviceId: null,
      createdAt: new Date(),
      update: jest.fn(),
    }

    MockUser.findByPk.mockResolvedValue(mockUser)

    const result = await updateStudentProfile('student-uuid-1', {
      firstName: 'Maria',
    })

    expect(mockUser.update).toHaveBeenCalledWith({ firstName: 'Maria' })
    expect(result.id).toBe('student-uuid-1')
  })

  it('should throw 404 when user not found', async () => {
    MockUser.findByPk.mockResolvedValue(null)

    await expect(
      updateStudentProfile('unknown', { firstName: 'Test' })
    ).rejects.toThrow(AppError)
  })
})

describe('deleteStudentAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete student and associated data', async () => {
    const mockUser = {
      id: 'student-uuid-1',
      destroy: jest.fn(),
    }

    MockUser.findByPk.mockResolvedValue(mockUser)

    const models = require('../../../models/index')

    models.CourseProgress.findAll.mockResolvedValue([])
    models.CourseProgress.destroy.mockResolvedValue(0)
    models.SectionProgress.destroy.mockResolvedValue(0)
    models.Certificate.destroy.mockResolvedValue(0)

    const result = await deleteStudentAccount('student-uuid-1')

    expect(result.deleted).toBe(true)
    expect(mockUser.destroy).toHaveBeenCalled()
  })

  it('should throw 404 when user not found', async () => {
    MockUser.findByPk.mockResolvedValue(null)

    await expect(deleteStudentAccount('unknown')).rejects.toThrow(AppError)
  })
})
