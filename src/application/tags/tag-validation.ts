type FieldErrors = Record<string, string>

export type TagPayload = {
  name: string
  description?: string
  isActive?: boolean
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const slugify = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const buildTagSlug = slugify

export const validateTagPayload = (
  payload: unknown,
  partial = false
): { data: TagPayload | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>
  const fieldErrors: FieldErrors = {}

  const name = normalizeText(body.name)
  const description = normalizeText(body.description)
  const isActive = body.isActive

  if (!partial || body.name !== undefined) {
    if (name.length < 2) {
      fieldErrors.name = 'LENGTH_INVALID'
    }
  }

  if (body.description !== undefined && description.length > 300) {
    fieldErrors.description = 'LENGTH_INVALID'
  }

  if (body.isActive !== undefined && typeof isActive !== 'boolean') {
    fieldErrors.isActive = 'INVALID'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  const data: TagPayload = {
    name,
  }

  if (body.description !== undefined) {
    data.description = description
  }

  if (body.isActive !== undefined) {
    data.isActive = isActive as boolean
  }

  return { data, fieldErrors }
}

export const validateTagIds = (
  value: unknown
): { tagIds: string[] | null; fieldErrors: FieldErrors } => {
  const fieldErrors: FieldErrors = {}

  if (!Array.isArray(value)) {
    fieldErrors.tagIds = 'INVALID'
    return { tagIds: null, fieldErrors }
  }

  const uniqueIds = Array.from(
    new Set(value.filter((item): item is string => typeof item === 'string'))
  )

  if (uniqueIds.length !== value.length) {
    fieldErrors.tagIds = 'INVALID'
    return { tagIds: null, fieldErrors }
  }

  return { tagIds: uniqueIds, fieldErrors }
}
