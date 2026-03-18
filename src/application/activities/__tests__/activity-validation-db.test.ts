import { validateDbActivityPayload } from '../activity-validation-db'

const VALID_MONGO_ID = '507f1f77bcf86cd799439011'
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

const validPayload = {
  id: 'activity-1',
  sectionId: 'section-1',
  type: 'text_reading',
  order: 0,
}

describe('validateDbActivityPayload', () => {
  describe('happy path', () => {
    it('should return data when all required fields are valid', () => {
      const result = validateDbActivityPayload(validPayload)
      expect(result.data).not.toBeNull()
      expect(Object.keys(result.fieldErrors)).toHaveLength(0)
    })

    it('should include optional fields when provided', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        title: 'My Activity',
        question: 'What is 2+2?',
        textPages: ['Page 1', 'Page 2'],
        options: ['Option A', 'Option B'],
        correctAnswer: 1,
        imageMediaId: VALID_MONGO_ID,
        icon: 'star',
        pauseTimestamp: 10,
      })
      expect(result.data).not.toBeNull()
      expect(result.data?.title).toBe('My Activity')
      expect(result.data?.question).toBe('What is 2+2?')
      expect(result.data?.textPages).toEqual(['Page 1', 'Page 2'])
      expect(result.data?.options).toEqual(['Option A', 'Option B'])
      expect(result.data?.correctAnswer).toBe(1)
      expect(result.data?.imageMediaId).toBe(VALID_MONGO_ID)
    })
  })

  describe('required fields', () => {
    it('should return REQUIRED when id is missing', () => {
      const result = validateDbActivityPayload({ ...validPayload, id: '' })
      expect(result.fieldErrors.id).toBe('REQUIRED')
    })

    it('should return REQUIRED when sectionId is missing', () => {
      const result = validateDbActivityPayload({ ...validPayload, sectionId: '' })
      expect(result.fieldErrors.sectionId).toBe('REQUIRED')
    })

    it('should return errors for empty payload', () => {
      const result = validateDbActivityPayload({})
      expect(result.data).toBeNull()
      expect(result.fieldErrors.id).toBe('REQUIRED')
      expect(result.fieldErrors.sectionId).toBe('REQUIRED')
      expect(result.fieldErrors.type).toBe('INVALID')
      expect(result.fieldErrors.order).toBe('INVALID')
    })
  })

  describe('type validation', () => {
    it.each(['video_pause', 'true_false', 'text_reading', 'multiple_choice'])(
      'should accept type "%s"',
      (type) => {
        const result = validateDbActivityPayload({ ...validPayload, type })
        expect(result.fieldErrors.type).toBeUndefined()
      }
    )

    it('should return INVALID for unknown type', () => {
      const result = validateDbActivityPayload({ ...validPayload, type: 'quiz' })
      expect(result.fieldErrors.type).toBe('INVALID')
    })

    it('should return INVALID for non-string type', () => {
      const result = validateDbActivityPayload({ ...validPayload, type: 123 })
      expect(result.fieldErrors.type).toBe('INVALID')
    })
  })

  describe('order validation', () => {
    it('should accept order of 0', () => {
      const result = validateDbActivityPayload({ ...validPayload, order: 0 })
      expect(result.fieldErrors.order).toBeUndefined()
    })

    it('should accept positive integer order', () => {
      const result = validateDbActivityPayload({ ...validPayload, order: 5 })
      expect(result.fieldErrors.order).toBeUndefined()
    })

    it('should return INVALID for negative order', () => {
      const result = validateDbActivityPayload({ ...validPayload, order: -1 })
      expect(result.fieldErrors.order).toBe('INVALID')
    })

    it('should return INVALID for non-integer order', () => {
      const result = validateDbActivityPayload({ ...validPayload, order: 1.5 })
      expect(result.fieldErrors.order).toBe('INVALID')
    })

    it('should return INVALID for non-number order', () => {
      const result = validateDbActivityPayload({ ...validPayload, order: 'first' })
      expect(result.fieldErrors.order).toBe('INVALID')
    })
  })

  describe('title validation', () => {
    it('should return LENGTH_INVALID when title exceeds 255 characters', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        title: 'A'.repeat(256),
      })
      expect(result.fieldErrors.title).toBe('LENGTH_INVALID')
    })

    it('should accept title at exactly 255 characters', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        title: 'A'.repeat(255),
      })
      expect(result.fieldErrors.title).toBeUndefined()
    })

    it('should accept null title', () => {
      const result = validateDbActivityPayload({ ...validPayload, title: null })
      expect(result.fieldErrors.title).toBeUndefined()
      expect(result.data?.title).toBeNull()
    })
  })

  describe('imageMediaId validation', () => {
    it('should accept valid MongoDB ObjectId', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        imageMediaId: VALID_MONGO_ID,
      })
      expect(result.fieldErrors.imageMediaId).toBeUndefined()
    })

    it('should accept valid UUID', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        imageMediaId: VALID_UUID,
      })
      expect(result.fieldErrors.imageMediaId).toBeUndefined()
    })

    it('should return INVALID for invalid imageMediaId format', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        imageMediaId: 'not-valid-id',
      })
      expect(result.fieldErrors.imageMediaId).toBe('INVALID')
    })

    it('should accept null imageMediaId', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        imageMediaId: null,
      })
      expect(result.fieldErrors.imageMediaId).toBeUndefined()
    })
  })

  describe('textPages validation', () => {
    it('should accept valid string array', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        textPages: ['Page 1', 'Page 2'],
      })
      expect(result.fieldErrors.textPages).toBeUndefined()
    })

    it('should return INVALID for non-string items in textPages', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        textPages: [1, 2, 3],
      })
      expect(result.fieldErrors.textPages).toBe('INVALID')
    })

    it('should accept null textPages', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        textPages: null,
      })
      expect(result.fieldErrors.textPages).toBeUndefined()
    })
  })

  describe('options validation', () => {
    it('should accept valid string array', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        options: ['A', 'B', 'C'],
      })
      expect(result.fieldErrors.options).toBeUndefined()
    })

    it('should return INVALID for non-string items in options', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        options: [1, 2],
      })
      expect(result.fieldErrors.options).toBe('INVALID')
    })

    it('should accept null options', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        options: null,
      })
      expect(result.fieldErrors.options).toBeUndefined()
    })
  })

  describe('correctAnswer validation', () => {
    it('should accept boolean correctAnswer', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        correctAnswer: true,
      })
      expect(result.fieldErrors.correctAnswer).toBeUndefined()
      expect(result.data?.correctAnswer).toBe(true)
    })

    it('should accept integer correctAnswer', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        correctAnswer: 2,
      })
      expect(result.fieldErrors.correctAnswer).toBeUndefined()
      expect(result.data?.correctAnswer).toBe(2)
    })

    it('should accept null correctAnswer', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        correctAnswer: null,
      })
      expect(result.fieldErrors.correctAnswer).toBeUndefined()
      expect(result.data?.correctAnswer).toBeNull()
    })

    it('should return INVALID for string correctAnswer', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        correctAnswer: 'yes',
      })
      expect(result.fieldErrors.correctAnswer).toBe('INVALID')
    })

    it('should return INVALID for float correctAnswer', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        correctAnswer: 1.5,
      })
      expect(result.fieldErrors.correctAnswer).toBe('INVALID')
    })
  })

  describe('pauseTimestamp validation', () => {
    it('should accept valid non-negative integer', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        pauseTimestamp: 120,
      })
      expect(result.fieldErrors.pauseTimestamp).toBeUndefined()
    })

    it('should accept null pauseTimestamp', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        pauseTimestamp: null,
      })
      expect(result.fieldErrors.pauseTimestamp).toBeUndefined()
    })

    it('should return INVALID for negative pauseTimestamp', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        pauseTimestamp: -1,
      })
      expect(result.fieldErrors.pauseTimestamp).toBe('INVALID')
    })

    it('should return INVALID for non-integer pauseTimestamp', () => {
      const result = validateDbActivityPayload({
        ...validPayload,
        pauseTimestamp: 1.5,
      })
      expect(result.fieldErrors.pauseTimestamp).toBe('INVALID')
    })
  })

  describe('partial mode', () => {
    it('should skip validation for fields not present in partial mode', () => {
      const result = validateDbActivityPayload({ title: 'Hello' }, true)
      expect(result.data).not.toBeNull()
      expect(Object.keys(result.fieldErrors)).toHaveLength(0)
    })

    it('should still validate fields that are present in partial mode', () => {
      const result = validateDbActivityPayload({ type: 'invalid' }, true)
      expect(result.fieldErrors.type).toBe('INVALID')
    })

    it('should return no errors for empty payload in partial mode', () => {
      const result = validateDbActivityPayload({}, true)
      expect(result.data).not.toBeNull()
      expect(Object.keys(result.fieldErrors)).toHaveLength(0)
    })
  })
})
