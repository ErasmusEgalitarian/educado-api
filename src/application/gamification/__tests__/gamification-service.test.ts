jest.mock('../../../config/database', () => ({
  sequelize: { define: jest.fn() },
}))

jest.mock('../../../models/index', () => ({
  PointsLedger: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
  },
  StudentStats: {
    findOrCreate: jest.fn(),
    findAll: jest.fn(),
  },
  Badge: {
    findAll: jest.fn(),
  },
  StudentBadge: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
}))

import {
  awardPoints,
  updateStreak,
  getGamificationSummary,
  getPointsHistory,
} from '../gamification-service'
import {
  PointsLedger,
  StudentStats,
  Badge,
  StudentBadge,
} from '../../../models/index'

const MockPointsLedger = PointsLedger as unknown as {
  create: jest.Mock
  findAndCountAll: jest.Mock
}
const MockStudentStats = StudentStats as unknown as {
  findOrCreate: jest.Mock
}
const MockBadge = Badge as unknown as { findAll: jest.Mock }
const MockStudentBadge = StudentBadge as unknown as {
  findAll: jest.Mock
  create: jest.Mock
}

const createMockStats = (overrides: Record<string, unknown> = {}) => ({
  totalPoints: 0,
  currentLevel: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  coursesCompleted: 0,
  sectionsCompleted: 0,
  update: jest.fn(),
  ...overrides,
})

describe('awardPoints', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should create a points ledger entry and update stats', async () => {
    const mockStats = createMockStats()
    MockStudentStats.findOrCreate.mockResolvedValue([mockStats, false])
    MockPointsLedger.create.mockResolvedValue({})
    MockBadge.findAll.mockResolvedValue([])
    MockStudentBadge.findAll.mockResolvedValue([])

    const result = await awardPoints('user-1', 'SECTION_COMPLETE', 'course-1')

    expect(result.points).toBe(100)
    expect(result.action).toBe('SECTION_COMPLETE')
    expect(MockPointsLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'SECTION_COMPLETE',
        points: 100,
      })
    )
    expect(mockStats.update).toHaveBeenCalled()
  })

  it('should award COURSE_COMPLETE with 500 points', async () => {
    const mockStats = createMockStats({ totalPoints: 500 })
    MockStudentStats.findOrCreate.mockResolvedValue([mockStats, false])
    MockPointsLedger.create.mockResolvedValue({})
    MockBadge.findAll.mockResolvedValue([])
    MockStudentBadge.findAll.mockResolvedValue([])

    const result = await awardPoints('user-1', 'COURSE_COMPLETE', 'course-1')

    expect(result.points).toBe(500)
  })

  it('should cap LOGIN_STREAK points at 70', async () => {
    const mockStats = createMockStats({ lastActiveDate: '2024-01-01' })
    MockStudentStats.findOrCreate.mockResolvedValue([mockStats, false])
    MockPointsLedger.create.mockResolvedValue({})
    MockBadge.findAll.mockResolvedValue([])
    MockStudentBadge.findAll.mockResolvedValue([])

    const result = await awardPoints('user-1', 'LOGIN_STREAK', undefined, {
      streakDay: 10,
    })

    expect(result.points).toBe(70) // capped at 70
  })

  it('should increment sectionsCompleted for SECTION_COMPLETE', async () => {
    const mockStats = createMockStats({ sectionsCompleted: 5 })
    MockStudentStats.findOrCreate.mockResolvedValue([mockStats, false])
    MockPointsLedger.create.mockResolvedValue({})
    MockBadge.findAll.mockResolvedValue([])
    MockStudentBadge.findAll.mockResolvedValue([])

    await awardPoints('user-1', 'SECTION_COMPLETE')

    expect(mockStats.update).toHaveBeenCalledWith(
      expect.objectContaining({ sectionsCompleted: 6 })
    )
  })
})

describe('updateStreak', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should start a new streak when no previous activity', async () => {
    const mockStats = createMockStats({ lastActiveDate: null })
    MockStudentStats.findOrCreate.mockResolvedValue([mockStats, false])
    MockPointsLedger.create.mockResolvedValue({})
    MockBadge.findAll.mockResolvedValue([])
    MockStudentBadge.findAll.mockResolvedValue([])

    const result = await updateStreak('user-1')

    expect(result.currentStreak).toBe(1)
    expect(mockStats.update).toHaveBeenCalledWith(
      expect.objectContaining({ currentStreak: 1 })
    )
  })

  it('should not update streak if already active today', async () => {
    const today = new Date().toISOString().split('T')[0]
    const mockStats = createMockStats({
      lastActiveDate: today,
      currentStreak: 3,
    })
    MockStudentStats.findOrCreate.mockResolvedValue([mockStats, false])

    const result = await updateStreak('user-1')

    expect(result.currentStreak).toBe(3)
    expect(mockStats.update).not.toHaveBeenCalled()
  })

  it('should increment streak when yesterday was active', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const mockStats = createMockStats({
      lastActiveDate: yesterdayStr,
      currentStreak: 5,
      longestStreak: 5,
    })
    MockStudentStats.findOrCreate.mockResolvedValue([mockStats, false])
    MockPointsLedger.create.mockResolvedValue({})
    MockBadge.findAll.mockResolvedValue([])
    MockStudentBadge.findAll.mockResolvedValue([])

    const result = await updateStreak('user-1')

    expect(result.currentStreak).toBe(6)
  })
})

describe('getGamificationSummary', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should return summary with all fields', async () => {
    const mockStats = createMockStats({
      totalPoints: 500,
      currentLevel: 2,
      currentStreak: 3,
      longestStreak: 5,
      coursesCompleted: 1,
      sectionsCompleted: 10,
    })
    MockStudentStats.findOrCreate.mockResolvedValue([mockStats, false])
    MockStudentBadge.findAll.mockResolvedValue([])

    const result = await getGamificationSummary('user-1')

    expect(result.totalPoints).toBe(500)
    expect(result.currentLevel).toBe(2)
    expect(result.levelName).toBe('Iniciante')
    expect(result.currentStreak).toBe(3)
    expect(result.recentBadges).toHaveLength(0)
  })
})

describe('getPointsHistory', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should return paginated history', async () => {
    MockPointsLedger.findAndCountAll.mockResolvedValue({
      rows: [
        {
          id: 'p-1',
          action: 'SECTION_COMPLETE',
          points: 100,
          courseId: 'c-1',
          metadata: null,
          earnedAt: new Date(),
        },
      ],
      count: 1,
    })

    const result = await getPointsHistory('user-1', 1, 20)

    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
  })
})
