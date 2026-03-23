type FieldErrors = Record<string, string>

export type ReviewInput = {
  courseId: string
  rating: number
  tags: string[]
  comment: string | null
}

export const validateReviewInput = (
  payload: unknown
): { data: ReviewInput | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>
  const fieldErrors: FieldErrors = {}

  if (!body.courseId || typeof body.courseId !== 'string') {
    fieldErrors.courseId = 'REQUIRED'
  }

  if (
    typeof body.rating !== 'number' ||
    !Number.isInteger(body.rating) ||
    body.rating < 1 ||
    body.rating > 5
  ) {
    fieldErrors.rating = 'MUST_BE_1_TO_5'
  }

  let tags: string[] = []
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      fieldErrors.tags = 'MUST_BE_ARRAY'
    } else if (body.tags.length > 5) {
      fieldErrors.tags = 'MAX_5_TAGS'
    } else if (!body.tags.every((t: unknown) => typeof t === 'string')) {
      fieldErrors.tags = 'MUST_BE_STRING_ARRAY'
    } else {
      tags = body.tags as string[]
    }
  }

  let comment: string | null = null
  if (body.comment !== undefined && body.comment !== null) {
    if (typeof body.comment !== 'string') {
      fieldErrors.comment = 'MUST_BE_STRING'
    } else if (body.comment.length > 1000) {
      fieldErrors.comment = 'MAX_1000_CHARS'
    } else {
      comment = body.comment.trim() || null
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  return {
    data: {
      courseId: body.courseId as string,
      rating: body.rating as number,
      tags,
      comment,
    },
    fieldErrors,
  }
}
