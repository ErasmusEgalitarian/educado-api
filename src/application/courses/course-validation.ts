type FieldErrors = Record<string, string>

import { shortenUrl } from '../../utils/shorten-url'

type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type CoursePayload = {
  title: string
  description: string
  shortDescription: string
  imageUrl: string
  difficulty: Difficulty
  estimatedTime: string
  passingThreshold: number
  category: string
  rating?: number | null
  tags: string[]
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const parseTags = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null

  const tags = value
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  return tags
}

const parseOptionalRating = (value: unknown): number | null | undefined => {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return value
}

const isValidDifficulty = (value: string): value is Difficulty => {
  return (
    value === 'beginner' || value === 'intermediate' || value === 'advanced'
  )
}

export const validateCoursePayload = (
  payload: unknown,
  partial = false
): { data: CoursePayload | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>
  const fieldErrors: FieldErrors = {}

  const title = normalizeText(body.title)
  const description = normalizeText(body.description)
  const shortDescription = normalizeText(body.shortDescription)
  const imageUrl = shortenUrl(normalizeText(body.imageUrl))
  const difficultyRaw = normalizeText(body.difficulty)
  const estimatedTime = normalizeText(body.estimatedTime)
  const category = normalizeText(body.category)

  const passingThresholdRaw = body.passingThreshold
  const passingThreshold =
    typeof passingThresholdRaw === 'number' &&
    Number.isInteger(passingThresholdRaw)
      ? passingThresholdRaw
      : NaN

  const tags = parseTags(body.tags)
  const rating = parseOptionalRating(body.rating)

  if (!partial || body.title !== undefined) {
    if (title.length < 3) fieldErrors.title = 'LENGTH_INVALID'
  }

  if (!partial || body.description !== undefined) {
    if (description.length < 20) fieldErrors.description = 'LENGTH_INVALID'
  }

  if (!partial || body.shortDescription !== undefined) {
    if (shortDescription.length < 10) {
      fieldErrors.shortDescription = 'LENGTH_INVALID'
    }
  }

  if (!partial || body.imageUrl !== undefined) {
    if (!imageUrl) fieldErrors.imageUrl = 'REQUIRED'
    if (imageUrl.length > 2048) fieldErrors.imageUrl = 'LENGTH_INVALID'
  }

  if (!partial || body.difficulty !== undefined) {
    if (!isValidDifficulty(difficultyRaw)) fieldErrors.difficulty = 'INVALID'
  }

  if (!partial || body.estimatedTime !== undefined) {
    if (!estimatedTime) fieldErrors.estimatedTime = 'REQUIRED'
  }

  if (!partial || body.passingThreshold !== undefined) {
    if (
      Number.isNaN(passingThreshold) ||
      passingThreshold < 0 ||
      passingThreshold > 100
    ) {
      fieldErrors.passingThreshold = 'RANGE_INVALID'
    }
  }

  if (!partial || body.category !== undefined) {
    if (!category) fieldErrors.category = 'REQUIRED'
  }

  if (!partial || body.tags !== undefined) {
    if (!tags) {
      fieldErrors.tags = 'INVALID'
    } else if (tags.length > 20) {
      fieldErrors.tags = 'MAX_ITEMS_EXCEEDED'
    }
  }

  if (body.rating !== undefined && rating === undefined) {
    fieldErrors.rating = 'INVALID'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  const safeDifficulty: Difficulty = isValidDifficulty(difficultyRaw)
    ? difficultyRaw
    : 'beginner'

  return {
    data: {
      title,
      description,
      shortDescription,
      imageUrl,
      difficulty: safeDifficulty,
      estimatedTime,
      passingThreshold: Number.isNaN(passingThreshold) ? 75 : passingThreshold,
      category,
      rating,
      tags: tags ?? [],
    },
    fieldErrors,
  }
}
