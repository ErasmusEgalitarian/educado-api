import { validateReviewInput } from '../review-validation'

describe('validateReviewInput', () => {
  const validPayload = {
    courseId: 'course-1',
    rating: 4,
    tags: ['Aulas interessantes'],
    comment: 'Muito bom!',
  }

  it('should accept valid input', () => {
    const result = validateReviewInput(validPayload)
    expect(result.data).not.toBeNull()
    expect(result.data?.rating).toBe(4)
    expect(Object.keys(result.fieldErrors)).toHaveLength(0)
  })

  it('should require courseId', () => {
    const result = validateReviewInput({ ...validPayload, courseId: undefined })
    expect(result.fieldErrors.courseId).toBe('REQUIRED')
  })

  it('should require rating between 1 and 5', () => {
    expect(
      validateReviewInput({ ...validPayload, rating: 0 }).fieldErrors.rating
    ).toBe('MUST_BE_1_TO_5')
    expect(
      validateReviewInput({ ...validPayload, rating: 6 }).fieldErrors.rating
    ).toBe('MUST_BE_1_TO_5')
    expect(
      validateReviewInput({ ...validPayload, rating: 3.5 }).fieldErrors.rating
    ).toBe('MUST_BE_1_TO_5')
  })

  it('should limit tags to 5', () => {
    const result = validateReviewInput({
      ...validPayload,
      tags: ['1', '2', '3', '4', '5', '6'],
    })
    expect(result.fieldErrors.tags).toBe('MAX_5_TAGS')
  })

  it('should validate tags are strings', () => {
    const result = validateReviewInput({
      ...validPayload,
      tags: [1, 2],
    })
    expect(result.fieldErrors.tags).toBe('MUST_BE_STRING_ARRAY')
  })

  it('should limit comment to 1000 chars', () => {
    const result = validateReviewInput({
      ...validPayload,
      comment: 'a'.repeat(1001),
    })
    expect(result.fieldErrors.comment).toBe('MAX_1000_CHARS')
  })

  it('should accept null comment', () => {
    const result = validateReviewInput({ ...validPayload, comment: null })
    expect(result.data).not.toBeNull()
    expect(result.data?.comment).toBeNull()
  })

  it('should accept empty tags array', () => {
    const result = validateReviewInput({ ...validPayload, tags: [] })
    expect(result.data).not.toBeNull()
    expect(result.data?.tags).toEqual([])
  })
})
