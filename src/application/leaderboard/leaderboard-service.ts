import { Op, fn, col, literal } from 'sequelize'
import { PointsLedger, User } from '../../models/index'

type LeaderboardEntry = {
  rank: number
  userId: string
  firstName: string
  lastName: string
  avatarMediaId: string | null
  points: number
}

type LeaderboardResult = {
  month: string
  entries: LeaderboardEntry[]
  userRank: LeaderboardEntry | null
  total: number
}

const getMonthRange = (month?: string) => {
  let year: number
  let monthNum: number

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const parts = month.split('-')
    year = parseInt(parts[0], 10)
    monthNum = parseInt(parts[1], 10) - 1
  } else {
    const now = new Date()
    year = now.getFullYear()
    monthNum = now.getMonth()
  }

  const start = new Date(year, monthNum, 1)
  const end = new Date(year, monthNum + 1, 1)

  return {
    start,
    end,
    key: `${year}-${String(monthNum + 1).padStart(2, '0')}`,
  }
}

const computeLeaderboard = async (
  whereClause: Record<string, unknown>,
  userId?: string,
  limit = 30
): Promise<{
  entries: LeaderboardEntry[]
  userRank: LeaderboardEntry | null
  total: number
}> => {
  const results = (await PointsLedger.findAll({
    where: whereClause,
    attributes: ['userId', [fn('SUM', col('points')), 'totalPoints']],
    group: ['userId'],
    order: [[literal('"totalPoints"'), 'DESC']],
    raw: true,
  })) as unknown as { userId: string; totalPoints: string }[]

  // Fetch user details for the top entries
  const allUserIds = results.map((r) => r.userId)
  const users =
    allUserIds.length > 0
      ? await User.findAll({
          where: { id: allUserIds },
          attributes: ['id', 'firstName', 'lastName', 'avatarMediaId'],
        })
      : []

  const userMap = new Map(users.map((u) => [u.id, u]))

  const rankedEntries: LeaderboardEntry[] = results.map((r, index) => {
    const user = userMap.get(r.userId)
    return {
      rank: index + 1,
      userId: r.userId,
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      avatarMediaId: user?.avatarMediaId ?? null,
      points: Number(r.totalPoints),
    }
  })

  const topEntries = rankedEntries.slice(0, limit)

  let userRank: LeaderboardEntry | null = null
  if (userId) {
    const userEntry = rankedEntries.find((e) => e.userId === userId)
    if (userEntry && userEntry.rank > limit) {
      userRank = userEntry
    } else if (userEntry) {
      userRank = userEntry
    }
  }

  return {
    entries: topEntries,
    userRank,
    total: rankedEntries.length,
  }
}

export const getGlobalMonthlyLeaderboard = async (
  month?: string,
  userId?: string
): Promise<LeaderboardResult> => {
  const range = getMonthRange(month)

  const whereClause = {
    earnedAt: {
      [Op.gte]: range.start,
      [Op.lt]: range.end,
    },
  }

  const result = await computeLeaderboard(whereClause, userId)

  return {
    month: range.key,
    ...result,
  }
}

export const getCourseLeaderboard = async (
  courseId: string,
  month?: string,
  userId?: string
): Promise<LeaderboardResult> => {
  const range = getMonthRange(month)

  const whereClause = {
    courseId,
    earnedAt: {
      [Op.gte]: range.start,
      [Op.lt]: range.end,
    },
  }

  const result = await computeLeaderboard(whereClause, userId)

  return {
    month: range.key,
    ...result,
  }
}
