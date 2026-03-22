jest.mock('../../../config/database', () => ({
  sequelize: { define: jest.fn() },
}))

jest.mock('../../../models/index', () => ({
  PointsLedger: {
    findAll: jest.fn(),
  },
  User: {
    findAll: jest.fn(),
  },
}))

import {
  getGlobalMonthlyLeaderboard,
  getCourseLeaderboard,
} from '../leaderboard-service'
import { PointsLedger, User } from '../../../models/index'

const MockPointsLedger = PointsLedger as unknown as { findAll: jest.Mock }
const MockUser = User as unknown as { findAll: jest.Mock }

describe('getGlobalMonthlyLeaderboard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should return ranked entries', async () => {
    MockPointsLedger.findAll.mockResolvedValue([
      { userId: 'user-1', totalPoints: '500' },
      { userId: 'user-2', totalPoints: '300' },
    ])
    MockUser.findAll.mockResolvedValue([
      {
        id: 'user-1',
        firstName: 'João',
        lastName: 'Silva',
        avatarMediaId: null,
      },
      {
        id: 'user-2',
        firstName: 'Maria',
        lastName: 'Santos',
        avatarMediaId: null,
      },
    ])

    const result = await getGlobalMonthlyLeaderboard()

    expect(result.entries).toHaveLength(2)
    expect(result.entries[0].rank).toBe(1)
    expect(result.entries[0].firstName).toBe('João')
    expect(result.entries[0].points).toBe(500)
    expect(result.entries[1].rank).toBe(2)
    expect(result.total).toBe(2)
  })

  it('should include user rank when userId is provided', async () => {
    MockPointsLedger.findAll.mockResolvedValue([
      { userId: 'user-1', totalPoints: '500' },
      { userId: 'user-2', totalPoints: '300' },
    ])
    MockUser.findAll.mockResolvedValue([
      {
        id: 'user-1',
        firstName: 'João',
        lastName: 'Silva',
        avatarMediaId: null,
      },
      {
        id: 'user-2',
        firstName: 'Maria',
        lastName: 'Santos',
        avatarMediaId: null,
      },
    ])

    const result = await getGlobalMonthlyLeaderboard(undefined, 'user-2')

    expect(result.userRank).not.toBeNull()
    expect(result.userRank?.rank).toBe(2)
    expect(result.userRank?.userId).toBe('user-2')
  })

  it('should return empty entries when no points exist', async () => {
    MockPointsLedger.findAll.mockResolvedValue([])
    MockUser.findAll.mockResolvedValue([])

    const result = await getGlobalMonthlyLeaderboard('2024-01')

    expect(result.entries).toHaveLength(0)
    expect(result.month).toBe('2024-01')
    expect(result.total).toBe(0)
  })
})

describe('getCourseLeaderboard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should filter by courseId', async () => {
    MockPointsLedger.findAll.mockResolvedValue([
      { userId: 'user-1', totalPoints: '200' },
    ])
    MockUser.findAll.mockResolvedValue([
      {
        id: 'user-1',
        firstName: 'João',
        lastName: 'Silva',
        avatarMediaId: null,
      },
    ])

    const result = await getCourseLeaderboard('course-1')

    expect(result.entries).toHaveLength(1)
    expect(MockPointsLedger.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ courseId: 'course-1' }),
      })
    )
  })
})
