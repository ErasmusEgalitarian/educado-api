export const POINT_ACTIONS = [
  'SECTION_COMPLETE',
  'COURSE_COMPLETE',
  'PERFECT_SCORE',
  'DAILY_FIRST',
  'LOGIN_STREAK',
  'REVIEW_SUBMITTED',
] as const

export type PointAction = (typeof POINT_ACTIONS)[number]

export const POINT_VALUES: Record<PointAction, number> = {
  SECTION_COMPLETE: 100,
  COURSE_COMPLETE: 500,
  PERFECT_SCORE: 50,
  DAILY_FIRST: 50,
  LOGIN_STREAK: 10,
  REVIEW_SUBMITTED: 30,
}

export const calculateLevel = (totalPoints: number): number => {
  return Math.max(1, Math.floor(Math.sqrt(totalPoints / 100)))
}

export const getLevelName = (level: number): string => {
  if (level <= 2) return 'Iniciante'
  if (level <= 5) return 'Aprendiz'
  if (level <= 9) return 'Estudioso'
  if (level <= 14) return 'Especialista'
  return 'Mestre'
}

export const getXpForNextLevel = (currentLevel: number): number => {
  return (currentLevel + 1) * (currentLevel + 1) * 100
}
