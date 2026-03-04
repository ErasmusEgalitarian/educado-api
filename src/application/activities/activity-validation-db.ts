type FieldErrors = Record<string, string>

type DbActivityType =
  | 'video_pause'
  | 'true_false'
  | 'text_reading'
  | 'multiple_choice'

export type DbActivityPayload = {
  id?: string
  sectionId: string
  title?: string | null
  type: DbActivityType
  order: number
  pauseTimestamp?: number | null
  textPages?: string[] | null
  question?: string | null
  imageUrl?: string | null
  options?: string[] | null
  correctAnswer?: number | boolean | null
  icon?: string | null
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const isDbType = (value: unknown): value is DbActivityType => {
  return (
    value === 'video_pause' ||
    value === 'true_false' ||
    value === 'text_reading' ||
    value === 'multiple_choice'
  )
}

const parseStringArray = (value: unknown): string[] | null => {
  if (value === null || value === undefined) return null
  if (!Array.isArray(value)) return null

  const sanitized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())

  if (sanitized.length !== value.length) {
    return null
  }

  return sanitized
}

const parseCorrectAnswer = (
  value: unknown
): number | boolean | null | undefined => {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value === 'boolean') return value
  if (typeof value === 'number' && Number.isInteger(value)) return value
  return undefined
}

export const validateDbActivityPayload = (
  payload: unknown,
  partial = false
): { data: DbActivityPayload | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>
  const fieldErrors: FieldErrors = {}

  const id = normalizeText(body.id)
  const sectionId = normalizeText(body.sectionId)
  const title = body.title === null ? null : normalizeText(body.title)
  const type = body.type
  const order = body.order
  const pauseTimestampRaw = body.pauseTimestamp
  const question = body.question === null ? null : normalizeText(body.question)
  const imageUrl = body.imageUrl === null ? null : normalizeText(body.imageUrl)
  const icon = body.icon === null ? null : normalizeText(body.icon)

  const textPages = parseStringArray(body.textPages)
  const options = parseStringArray(body.options)
  const correctAnswer = parseCorrectAnswer(body.correctAnswer)

  if (!partial || body.id !== undefined) {
    if (!id) fieldErrors.id = 'REQUIRED'
  }

  if (!partial || body.sectionId !== undefined) {
    if (!sectionId) fieldErrors.sectionId = 'REQUIRED'
  }

  if (!partial || body.type !== undefined) {
    if (!isDbType(type)) fieldErrors.type = 'INVALID'
  }

  if (!partial || body.order !== undefined) {
    if (typeof order !== 'number' || !Number.isInteger(order) || order < 0) {
      fieldErrors.order = 'INVALID'
    }
  }

  if (body.title !== undefined && title !== null && title.length > 255) {
    fieldErrors.title = 'LENGTH_INVALID'
  }

  if (body.pauseTimestamp !== undefined && pauseTimestampRaw !== null) {
    if (
      typeof pauseTimestampRaw !== 'number' ||
      !Number.isInteger(pauseTimestampRaw) ||
      pauseTimestampRaw < 0
    ) {
      fieldErrors.pauseTimestamp = 'INVALID'
    }
  }

  if (
    body.textPages !== undefined &&
    textPages === null &&
    body.textPages !== null
  ) {
    fieldErrors.textPages = 'INVALID'
  }

  if (body.options !== undefined && options === null && body.options !== null) {
    fieldErrors.options = 'INVALID'
  }

  if (body.correctAnswer !== undefined && correctAnswer === undefined) {
    fieldErrors.correctAnswer = 'INVALID'
  }

  if (
    body.imageUrl !== undefined &&
    imageUrl !== null &&
    imageUrl.length > 2048
  ) {
    fieldErrors.imageUrl = 'LENGTH_INVALID'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  const data = {} as DbActivityPayload

  if (!partial) {
    data.sectionId = sectionId
    data.type = isDbType(type) ? type : 'text_reading'
    data.order = typeof order === 'number' ? order : 0
    data.id = id
  } else {
    if (body.sectionId !== undefined) data.sectionId = sectionId
    if (body.type !== undefined) data.type = type as DbActivityType
    if (body.order !== undefined) data.order = order as number
    if (body.id !== undefined) data.id = id
  }

  if (body.title !== undefined) data.title = title
  if (body.pauseTimestamp !== undefined) {
    data.pauseTimestamp =
      pauseTimestampRaw === null ? null : (pauseTimestampRaw as number)
  }
  if (body.textPages !== undefined) data.textPages = textPages
  if (body.question !== undefined) data.question = question
  if (body.imageUrl !== undefined) data.imageUrl = imageUrl
  if (body.options !== undefined) data.options = options
  if (body.correctAnswer !== undefined) data.correctAnswer = correctAnswer
  if (body.icon !== undefined) data.icon = icon

  return { data, fieldErrors }
}
