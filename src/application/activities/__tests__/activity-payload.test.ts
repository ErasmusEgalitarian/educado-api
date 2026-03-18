import { validateAndMapActivityPayload } from '../activity-payload'

describe('validateAndMapActivityPayload', () => {
  describe('invalid type', () => {
    it('should return INVALID type error for missing type', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({})
      expect(data).toBeNull()
      expect(fieldErrors.type).toBe('INVALID')
    })

    it('should return INVALID type error for unknown type', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({ type: 'unknown' })
      expect(data).toBeNull()
      expect(fieldErrors.type).toBe('INVALID')
    })

    it('should handle non-object payload', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload('not-an-object')
      expect(data).toBeNull()
      expect(fieldErrors.type).toBe('INVALID')
    })

    it('should handle null payload', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload(null)
      expect(data).toBeNull()
      expect(fieldErrors.type).toBe('INVALID')
    })
  })

  describe('Aula_texto', () => {
    it('should validate and map a valid text activity', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'Aula_texto',
        sectionId: 'sec-1',
        order: 0,
        title: 'Lesson 1',
        content: { text: 'Some text content' },
      })
      expect(Object.keys(fieldErrors)).toHaveLength(0)
      expect(data).not.toBeNull()
      expect(data!.type).toBe('text_reading')
      expect(data!.textPages).toEqual(['Some text content'])
    })

    it('should require content.text', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'Aula_texto',
        sectionId: 'sec-1',
        order: 0,
        title: 'Lesson 1',
        content: {},
      })
      expect(data).toBeNull()
      expect(fieldErrors['content.text']).toBe('REQUIRED')
    })

    it('should require sectionId and title', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'Aula_texto',
        order: 0,
        content: { text: 'text' },
      })
      expect(data).toBeNull()
      expect(fieldErrors.sectionId).toBe('REQUIRED')
      expect(fieldErrors.title).toBe('REQUIRED')
    })

    it('should reject invalid order', () => {
      const { fieldErrors } = validateAndMapActivityPayload({
        type: 'Aula_texto',
        sectionId: 'sec-1',
        order: -1,
        title: 'Lesson',
        content: { text: 'text' },
      })
      expect(fieldErrors.order).toBe('INVALID')
    })
  })

  describe('Aula_video', () => {
    it('should validate and map a valid video activity', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'Aula_video',
        sectionId: 'sec-1',
        order: 0,
        title: 'Video Lesson',
        video: { fileUrl: 'http://example.com/video.mp4', durationSeconds: 60 },
        finalQuestionEnabled: false,
      })
      expect(Object.keys(fieldErrors)).toHaveLength(0)
      expect(data).not.toBeNull()
      expect(data!.type).toBe('video_pause')
      expect(data!.pauseTimestamp).toBe(60)
    })

    it('should require video.fileUrl', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'Aula_video',
        sectionId: 'sec-1',
        order: 0,
        title: 'Video',
        video: { durationSeconds: 60 },
        finalQuestionEnabled: false,
      })
      expect(data).toBeNull()
      expect(fieldErrors['video.fileUrl']).toBe('REQUIRED')
    })

    it('should reject durationSeconds out of range', () => {
      const { fieldErrors } = validateAndMapActivityPayload({
        type: 'Aula_video',
        sectionId: 'sec-1',
        order: 0,
        title: 'Video',
        video: { fileUrl: 'http://x.com/v.mp4', durationSeconds: 200 },
        finalQuestionEnabled: false,
      })
      expect(fieldErrors['video.durationSeconds']).toBe('RANGE_INVALID')
    })

    it('should validate final question when enabled', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'Aula_video',
        sectionId: 'sec-1',
        order: 0,
        title: 'Video',
        video: { fileUrl: 'http://x.com/v.mp4', durationSeconds: 60 },
        finalQuestionEnabled: true,
        finalQuestion: {
          question: 'What?',
          alternatives: ['A', 'B'],
          correctAlternativeIndex: 0,
        },
      })
      expect(Object.keys(fieldErrors)).toHaveLength(0)
      expect(data!.question).toBe('What?')
      expect(data!.options).toEqual(['A', 'B'])
      expect(data!.correctAnswer).toBe(0)
    })

    it('should require finalQuestion when finalQuestionEnabled is true', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'Aula_video',
        sectionId: 'sec-1',
        order: 0,
        title: 'Video',
        video: { fileUrl: 'http://x.com/v.mp4', durationSeconds: 60 },
        finalQuestionEnabled: true,
      })
      expect(data).toBeNull()
      expect(fieldErrors.finalQuestion).toBe('REQUIRED')
    })
  })

  describe('Exercicio_multiple_choices', () => {
    it('should validate and map a valid multiple choice activity', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'Exercicio_multiple_choices',
        sectionId: 'sec-1',
        order: 0,
        title: 'Quiz',
        question: 'What is 2+2?',
        alternatives: ['3', '4', '5'],
        correctAlternativeIndex: 1,
      })
      expect(Object.keys(fieldErrors)).toHaveLength(0)
      expect(data!.type).toBe('multiple_choice')
      expect(data!.question).toBe('What is 2+2?')
      expect(data!.options).toEqual(['3', '4', '5'])
      expect(data!.correctAnswer).toBe(1)
    })

    it('should require question', () => {
      const { fieldErrors } = validateAndMapActivityPayload({
        type: 'Exercicio_multiple_choices',
        sectionId: 'sec-1',
        order: 0,
        title: 'Quiz',
        alternatives: ['A', 'B'],
        correctAlternativeIndex: 0,
      })
      expect(fieldErrors.question).toBe('REQUIRED')
    })

    it('should reject too few alternatives', () => {
      const { fieldErrors } = validateAndMapActivityPayload({
        type: 'Exercicio_multiple_choices',
        sectionId: 'sec-1',
        order: 0,
        title: 'Quiz',
        question: 'Q?',
        alternatives: ['A'],
        correctAlternativeIndex: 0,
      })
      expect(fieldErrors.alternatives).toBe('LENGTH_INVALID')
    })

    it('should accept an optional image', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'Exercicio_multiple_choices',
        sectionId: 'sec-1',
        order: 0,
        title: 'Quiz',
        question: 'Q?',
        alternatives: ['A', 'B'],
        correctAlternativeIndex: 0,
        image: { fileUrl: 'http://img.com/pic.png' },
      })
      expect(Object.keys(fieldErrors)).toHaveLength(0)
      expect(data!.imageUrl).toBe('http://img.com/pic.png')
    })
  })

  describe('exercicio_verdadeiro_falso', () => {
    it('should validate and map a valid true/false activity', () => {
      const { data, fieldErrors } = validateAndMapActivityPayload({
        type: 'exercicio_verdadeiro_falso',
        sectionId: 'sec-1',
        order: 0,
        title: 'True or False',
        question: 'Is the sky blue?',
        correctAnswer: 'Verdadeiro',
      })
      expect(Object.keys(fieldErrors)).toHaveLength(0)
      expect(data!.type).toBe('true_false')
      expect(data!.correctAnswer).toBe(true)
    })

    it('should map Falso to false', () => {
      const { data } = validateAndMapActivityPayload({
        type: 'exercicio_verdadeiro_falso',
        sectionId: 'sec-1',
        order: 0,
        title: 'TF',
        question: 'Q?',
        correctAnswer: 'Falso',
      })
      expect(data!.correctAnswer).toBe(false)
    })

    it('should reject invalid correctAnswer', () => {
      const { fieldErrors } = validateAndMapActivityPayload({
        type: 'exercicio_verdadeiro_falso',
        sectionId: 'sec-1',
        order: 0,
        title: 'TF',
        question: 'Q?',
        correctAnswer: 'maybe',
      })
      expect(fieldErrors.correctAnswer).toBe('INVALID')
    })

    it('should require question', () => {
      const { fieldErrors } = validateAndMapActivityPayload({
        type: 'exercicio_verdadeiro_falso',
        sectionId: 'sec-1',
        order: 0,
        title: 'TF',
        correctAnswer: 'Verdadeiro',
      })
      expect(fieldErrors.question).toBe('REQUIRED')
    })
  })

  describe('base field validation', () => {
    it('should generate an id if not provided', () => {
      const { data } = validateAndMapActivityPayload({
        type: 'Aula_texto',
        sectionId: 'sec-1',
        order: 0,
        title: 'Lesson',
        content: { text: 'text' },
      })
      expect(data!.id).toBeDefined()
      expect(data!.id.length).toBeGreaterThan(0)
    })

    it('should use provided id', () => {
      const { data } = validateAndMapActivityPayload({
        type: 'Aula_texto',
        id: 'custom-id',
        sectionId: 'sec-1',
        order: 0,
        title: 'Lesson',
        content: { text: 'text' },
      })
      expect(data!.id).toBe('custom-id')
    })
  })
})
