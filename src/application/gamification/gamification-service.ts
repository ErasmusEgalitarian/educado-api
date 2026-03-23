import {
  PointsLedger,
  StudentStats,
  Badge,
  StudentBadge,
} from '../../models/index'
import {
  PointAction,
  POINT_VALUES,
  calculateLevel,
  getLevelName,
  getXpForNextLevel,
} from '../../domain/gamification/enums'

const getOrCreateStats = async (userId: string): Promise<StudentStats> => {
  const [stats] = await StudentStats.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      totalPoints: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      coursesCompleted: 0,
      sectionsCompleted: 0,
    },
  })
  return stats
}

export const awardPoints = async (
  userId: string,
  action: PointAction,
  courseId?: string,
  metadata?: Record<string, unknown>
) => {
  let points = POINT_VALUES[action]

  // LOGIN_STREAK: multiply by streak day, max 70
  if (action === 'LOGIN_STREAK' && metadata?.streakDay) {
    points = Math.min(70, points * (metadata.streakDay as number))
  }

  await PointsLedger.create({
    userId,
    courseId: courseId ?? null,
    action,
    points,
    metadata: metadata ?? null,
    earnedAt: new Date(),
  })

  const stats = await getOrCreateStats(userId)

  const newTotal = stats.totalPoints + points
  const newLevel = calculateLevel(newTotal)

  const updateData: Record<string, unknown> = {
    totalPoints: newTotal,
    currentLevel: newLevel,
  }

  if (action === 'SECTION_COMPLETE') {
    updateData.sectionsCompleted = stats.sectionsCompleted + 1
  }
  if (action === 'COURSE_COMPLETE') {
    updateData.coursesCompleted = stats.coursesCompleted + 1
  }

  await stats.update(updateData)

  // Check for daily first completion
  const today = new Date().toISOString().split('T')[0]
  if (action === 'SECTION_COMPLETE' && stats.lastActiveDate !== today) {
    // Award daily first bonus
    await PointsLedger.create({
      userId,
      courseId: courseId ?? null,
      action: 'DAILY_FIRST',
      points: POINT_VALUES.DAILY_FIRST,
      metadata: null,
      earnedAt: new Date(),
    })

    await stats.update({
      totalPoints: newTotal + POINT_VALUES.DAILY_FIRST,
      currentLevel: calculateLevel(newTotal + POINT_VALUES.DAILY_FIRST),
    })
  }

  await checkAndAwardBadges(userId)

  return { points, action, totalPoints: newTotal }
}

export const updateStreak = async (userId: string) => {
  const stats = await getOrCreateStats(userId)
  const today = new Date().toISOString().split('T')[0]

  if (stats.lastActiveDate === today) {
    return { currentStreak: stats.currentStreak }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak: number
  if (stats.lastActiveDate === yesterdayStr) {
    newStreak = stats.currentStreak + 1
  } else {
    newStreak = 1
  }

  const longestStreak = Math.max(stats.longestStreak, newStreak)

  await stats.update({
    currentStreak: newStreak,
    longestStreak,
    lastActiveDate: today,
  })

  // Award streak points
  if (newStreak > 1) {
    await awardPoints(userId, 'LOGIN_STREAK', undefined, {
      streakDay: newStreak,
    })
  }

  return { currentStreak: newStreak }
}

export const checkAndAwardBadges = async (userId: string) => {
  const stats = await getOrCreateStats(userId)
  const allBadges = await Badge.findAll()
  const earnedBadgeIds = (
    await StudentBadge.findAll({
      where: { userId },
      attributes: ['badgeId'],
    })
  ).map((sb) => sb.badgeId)

  const newBadges: Badge[] = []

  for (const badge of allBadges) {
    if (earnedBadgeIds.includes(badge.id)) continue

    const criteria = badge.criteria as {
      type: string
      threshold: number
    }

    let earned = false

    switch (criteria.type) {
      case 'courses_completed':
        earned = stats.coursesCompleted >= criteria.threshold
        break
      case 'sections_completed':
        earned = stats.sectionsCompleted >= criteria.threshold
        break
      case 'total_points':
        earned = stats.totalPoints >= criteria.threshold
        break
      case 'streak':
        earned = stats.longestStreak >= criteria.threshold
        break
    }

    if (earned) {
      await StudentBadge.create({
        userId,
        badgeId: badge.id,
        earnedAt: new Date(),
      })
      newBadges.push(badge)
    }
  }

  return newBadges
}

export const getGamificationSummary = async (userId: string) => {
  const stats = await getOrCreateStats(userId)

  const badges = await StudentBadge.findAll({
    where: { userId },
    include: [{ model: Badge, as: 'badge' }],
    order: [['earnedAt', 'DESC']],
    limit: 10,
  })

  const levelName = getLevelName(stats.currentLevel)
  const xpForNextLevel = getXpForNextLevel(stats.currentLevel)
  const currentLevelXp = stats.currentLevel * stats.currentLevel * 100
  const xpProgress = stats.totalPoints - currentLevelXp
  const xpNeeded = xpForNextLevel - currentLevelXp

  return {
    totalPoints: stats.totalPoints,
    currentLevel: stats.currentLevel,
    levelName,
    xpProgress: Math.max(0, xpProgress),
    xpNeeded,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    coursesCompleted: stats.coursesCompleted,
    sectionsCompleted: stats.sectionsCompleted,
    recentBadges: badges.map((sb) => {
      const badge = sb.get('badge') as Badge | null
      return {
        id: sb.badgeId,
        key: badge?.key ?? '',
        name: badge?.name ?? '',
        description: badge?.description ?? '',
        iconUrl: badge?.iconUrl ?? null,
        earnedAt: sb.earnedAt,
      }
    }),
  }
}

export const getStudentBadges = async (userId: string) => {
  const badges = await StudentBadge.findAll({
    where: { userId },
    include: [{ model: Badge, as: 'badge' }],
    order: [['earnedAt', 'DESC']],
  })

  return badges.map((sb) => {
    const badge = sb.get('badge') as Badge | null
    return {
      id: sb.badgeId,
      key: badge?.key ?? '',
      name: badge?.name ?? '',
      description: badge?.description ?? '',
      iconUrl: badge?.iconUrl ?? null,
      earnedAt: sb.earnedAt,
    }
  })
}

export const getPointsHistory = async (
  userId: string,
  page = 1,
  limit = 20
) => {
  const offset = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit))

  const { rows, count } = await PointsLedger.findAndCountAll({
    where: { userId },
    order: [['earnedAt', 'DESC']],
    offset,
    limit: Math.min(100, Math.max(1, limit)),
  })

  return {
    items: rows.map((entry) => ({
      id: entry.id,
      action: entry.action,
      points: entry.points,
      courseId: entry.courseId,
      metadata: entry.metadata,
      earnedAt: entry.earnedAt,
    })),
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    total: count,
  }
}
