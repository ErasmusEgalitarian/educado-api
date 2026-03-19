import { validateCoursePayload } from '../course-validation'

const VALID_MONGO_ID = '507f1f77bcf86cd799439011'
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

const validPayload = {
  title: 'My Course',
  description: 'A description that is at least twenty characters long',
  shortDescription: 'Short desc for course',
  imageMediaId: VALID_MONGO_ID,
  difficulty: 'beginner',
  estimatedTime: '2 hours',
  passingThreshold: 75,
  category: 'math',
  tags: ['tag1', 'tag2'],
}

describe('validateCoursePayload', () => {
  describe('happy path', () => {
    it('should return data when all fields are valid', () => {
      const result = validateCoursePayload(validPayload)
      expect(result.data).not.toBeNull()
      expect(Object.keys(result.fieldErrors)).toHaveLength(0)
    })

    it('should accept UUID as imageMediaId', () => {
      const result = validateCoursePayload({
        ...validPayload,
        imageMediaId: VALID_UUID,
      })
      expect(result.data).not.toBeNull()
      expect(result.fieldErrors.imageMediaId).toBeUndefined()
    })

    it('should accept rating as null', () => {
      const result = validateCoursePayload({ ...validPayload, rating: null })
      expect(result.data?.rating).toBeNull()
    })

    it('should accept rating as a number', () => {
      const result = validateCoursePayload({ ...validPayload, rating: 4.5 })
      expect(result.data?.rating).toBe(4.5)
    })

    it('should default rating to undefined when not provided', () => {
      const result = validateCoursePayload(validPayload)
      expect(result.data?.rating).toBeUndefined()
    })
  })

  describe('title validation', () => {
    it('should return LENGTH_INVALID when title is less than 3 characters', () => {
      const result = validateCoursePayload({ ...validPayload, title: 'AB' })
      expect(result.fieldErrors.title).toBe('LENGTH_INVALID')
    })

    it('should accept title with exactly 3 characters', () => {
      const result = validateCoursePayload({ ...validPayload, title: 'ABC' })
      expect(result.fieldErrors.title).toBeUndefined()
    })

    it('should return LENGTH_INVALID when title is empty', () => {
      const result = validateCoursePayload({ ...validPayload, title: '' })
      expect(result.fieldErrors.title).toBe('LENGTH_INVALID')
    })
  })

  describe('description validation', () => {
    it('should return LENGTH_INVALID when description is less than 20 characters', () => {
      const result = validateCoursePayload({
        ...validPayload,
        description: 'Too short',
      })
      expect(result.fieldErrors.description).toBe('LENGTH_INVALID')
    })

    it('should accept description with exactly 20 characters', () => {
      const result = validateCoursePayload({
        ...validPayload,
        description: '12345678901234567890',
      })
      expect(result.fieldErrors.description).toBeUndefined()
    })
  })

  describe('shortDescription validation', () => {
    it('should return LENGTH_INVALID when shortDescription is less than 10 characters', () => {
      const result = validateCoursePayload({
        ...validPayload,
        shortDescription: 'Short',
      })
      expect(result.fieldErrors.shortDescription).toBe('LENGTH_INVALID')
    })

    it('should accept shortDescription with exactly 10 characters', () => {
      const result = validateCoursePayload({
        ...validPayload,
        shortDescription: '1234567890',
      })
      expect(result.fieldErrors.shortDescription).toBeUndefined()
    })
  })

  describe('imageMediaId validation', () => {
    it('should return REQUIRED when imageMediaId is empty', () => {
      const result = validateCoursePayload({
        ...validPayload,
        imageMediaId: '',
      })
      expect(result.fieldErrors.imageMediaId).toBe('REQUIRED')
    })

    it('should return INVALID for invalid format', () => {
      const result = validateCoursePayload({
        ...validPayload,
        imageMediaId: 'not-valid',
      })
      expect(result.fieldErrors.imageMediaId).toBe('INVALID')
    })

    it('should accept valid MongoDB ObjectId', () => {
      const result = validateCoursePayload({
        ...validPayload,
        imageMediaId: VALID_MONGO_ID,
      })
      expect(result.fieldErrors.imageMediaId).toBeUndefined()
    })

    it('should accept valid UUID', () => {
      const result = validateCoursePayload({
        ...validPayload,
        imageMediaId: VALID_UUID,
      })
      expect(result.fieldErrors.imageMediaId).toBeUndefined()
    })
  })

  describe('difficulty validation', () => {
    it('should return INVALID for unknown difficulty', () => {
      const result = validateCoursePayload({
        ...validPayload,
        difficulty: 'expert',
      })
      expect(result.fieldErrors.difficulty).toBe('INVALID')
    })

    it.each(['beginner', 'intermediate', 'advanced'])(
      'should accept difficulty "%s"',
      (difficulty) => {
        const result = validateCoursePayload({ ...validPayload, difficulty })
        expect(result.fieldErrors.difficulty).toBeUndefined()
      }
    )
  })

  describe('estimatedTime validation', () => {
    it('should return REQUIRED when estimatedTime is empty', () => {
      const result = validateCoursePayload({
        ...validPayload,
        estimatedTime: '',
      })
      expect(result.fieldErrors.estimatedTime).toBe('REQUIRED')
    })
  })

  describe('passingThreshold validation', () => {
    it('should return RANGE_INVALID when passingThreshold is negative', () => {
      const result = validateCoursePayload({
        ...validPayload,
        passingThreshold: -1,
      })
      expect(result.fieldErrors.passingThreshold).toBe('RANGE_INVALID')
    })

    it('should return RANGE_INVALID when passingThreshold is over 100', () => {
      const result = validateCoursePayload({
        ...validPayload,
        passingThreshold: 101,
      })
      expect(result.fieldErrors.passingThreshold).toBe('RANGE_INVALID')
    })

    it('should return RANGE_INVALID when passingThreshold is not an integer', () => {
      const result = validateCoursePayload({
        ...validPayload,
        passingThreshold: 75.5,
      })
      expect(result.fieldErrors.passingThreshold).toBe('RANGE_INVALID')
    })

    it('should return RANGE_INVALID when passingThreshold is NaN', () => {
      const result = validateCoursePayload({
        ...validPayload,
        passingThreshold: 'abc',
      })
      expect(result.fieldErrors.passingThreshold).toBe('RANGE_INVALID')
    })

    it('should accept passingThreshold of 0', () => {
      const result = validateCoursePayload({
        ...validPayload,
        passingThreshold: 0,
      })
      expect(result.fieldErrors.passingThreshold).toBeUndefined()
    })

    it('should accept passingThreshold of 100', () => {
      const result = validateCoursePayload({
        ...validPayload,
        passingThreshold: 100,
      })
      expect(result.fieldErrors.passingThreshold).toBeUndefined()
    })
  })

  describe('category validation', () => {
    it('should return REQUIRED when category is empty', () => {
      const result = validateCoursePayload({ ...validPayload, category: '' })
      expect(result.fieldErrors.category).toBe('REQUIRED')
    })
  })

  describe('tags validation', () => {
    it('should return INVALID when tags is not an array', () => {
      const result = validateCoursePayload({
        ...validPayload,
        tags: 'not-array',
      })
      expect(result.fieldErrors.tags).toBe('INVALID')
    })

    it('should return MAX_ITEMS_EXCEEDED when tags has more than 20 items', () => {
      const result = validateCoursePayload({
        ...validPayload,
        tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
      })
      expect(result.fieldErrors.tags).toBe('MAX_ITEMS_EXCEEDED')
    })

    it('should accept empty tags array', () => {
      const result = validateCoursePayload({ ...validPayload, tags: [] })
      expect(result.fieldErrors.tags).toBeUndefined()
    })

    it('should accept up to 20 tags', () => {
      const result = validateCoursePayload({
        ...validPayload,
        tags: Array.from({ length: 20 }, (_, i) => `tag${i}`),
      })
      expect(result.fieldErrors.tags).toBeUndefined()
    })
  })

  describe('rating validation', () => {
    it('should return INVALID when rating is a non-numeric value', () => {
      const result = validateCoursePayload({ ...validPayload, rating: 'abc' })
      expect(result.fieldErrors.rating).toBe('INVALID')
    })

    it('should not error when rating is omitted', () => {
      const result = validateCoursePayload(validPayload)
      expect(result.fieldErrors.rating).toBeUndefined()
    })
  })

  describe('partial mode', () => {
    it('should skip validation for fields not present in partial mode', () => {
      const result = validateCoursePayload({ title: 'Valid Title' }, true)
      expect(result.data).not.toBeNull()
      expect(Object.keys(result.fieldErrors)).toHaveLength(0)
    })

    it('should still validate fields that are present in partial mode', () => {
      const result = validateCoursePayload({ title: 'AB' }, true)
      expect(result.fieldErrors.title).toBe('LENGTH_INVALID')
    })

    it('should return no errors for empty payload in partial mode', () => {
      const result = validateCoursePayload({}, true)
      expect(result.data).not.toBeNull()
      expect(Object.keys(result.fieldErrors)).toHaveLength(0)
    })
  })
})
