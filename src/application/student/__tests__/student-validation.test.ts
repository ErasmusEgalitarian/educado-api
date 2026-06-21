import {
  validateStudentRegistration,
  validateStudentProfileUpdate,
} from '../student-validation'

describe('validateStudentRegistration', () => {
  const validPayload = {
    firstName: 'João',
    lastName: 'Silva',
    phone: '11999998888',
  }

  describe('happy path', () => {
    it('should return data with only required fields', () => {
      const result = validateStudentRegistration(validPayload)
      expect(result.data).not.toBeNull()
      expect(result.data?.firstName).toBe('João')
      expect(result.data?.lastName).toBe('Silva')
      expect(result.data?.phone).toBe('11999998888')
      expect(Object.keys(result.fieldErrors)).toHaveLength(0)
    })

    it('should accept all optional fields', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        dateOfBirth: '1990-01-15',
        deviceId: 'device-abc-123',
      })
      expect(result.data).not.toBeNull()
      expect(result.data?.phone).toBe('11999998888')
      expect(result.data?.dateOfBirth).toBe('1990-01-15')
      expect(result.data?.deviceId).toBe('device-abc-123')
    })

    it('should trim whitespace from fields', () => {
      const result = validateStudentRegistration({
        firstName: '  João  ',
        lastName: '  Silva  ',
        phone: '  11999998888  ',
      })
      expect(result.data?.firstName).toBe('João')
      expect(result.data?.lastName).toBe('Silva')
      expect(result.data?.phone).toBe('11999998888')
    })

    it('should not include optional fields when not provided', () => {
      const result = validateStudentRegistration(validPayload)
      expect(result.data).not.toBeNull()
      expect(result.data).not.toHaveProperty('dateOfBirth')
      expect(result.data).not.toHaveProperty('deviceId')
    })

    it('should not accept email on registration', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        email: 'joao@example.com',
      })
      expect(result.data).not.toBeNull()
      expect(result.data).not.toHaveProperty('email')
    })
  })

  describe('firstName validation', () => {
    it('should return LENGTH_INVALID when firstName is too short', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        firstName: 'A',
      })
      expect(result.fieldErrors.firstName).toBe('LENGTH_INVALID')
      expect(result.data).toBeNull()
    })

    it('should return LENGTH_INVALID when firstName is empty', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        firstName: '',
      })
      expect(result.fieldErrors.firstName).toBe('LENGTH_INVALID')
    })

    it('should return LENGTH_INVALID when firstName is missing', () => {
      const result = validateStudentRegistration({ lastName: 'Silva' })
      expect(result.fieldErrors.firstName).toBe('LENGTH_INVALID')
    })
  })

  describe('lastName validation', () => {
    it('should return LENGTH_INVALID when lastName is too short', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        lastName: 'B',
      })
      expect(result.fieldErrors.lastName).toBe('LENGTH_INVALID')
      expect(result.data).toBeNull()
    })
  })

  describe('phone validation', () => {
    it('should return REQUIRED when phone is missing', () => {
      const result = validateStudentRegistration({
        firstName: 'João',
        lastName: 'Silva',
      })
      expect(result.fieldErrors.phone).toBe('REQUIRED')
      expect(result.data).toBeNull()
    })

    it('should return REQUIRED when phone is empty', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        phone: '   ',
      })
      expect(result.fieldErrors.phone).toBe('REQUIRED')
    })

    it('should return LENGTH_INVALID when phone is too short', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        phone: '1234567',
      })
      expect(result.fieldErrors.phone).toBe('LENGTH_INVALID')
    })

    it('should return LENGTH_INVALID when phone is too long', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        phone: '1'.repeat(21),
      })
      expect(result.fieldErrors.phone).toBe('LENGTH_INVALID')
    })

    it('should accept valid phone', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        phone: '11999998888',
      })
      expect(result.data?.phone).toBe('11999998888')
    })
  })

  describe('dateOfBirth validation', () => {
    it('should return FORMAT_INVALID for invalid date', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        dateOfBirth: 'not-a-date',
      })
      expect(result.fieldErrors.dateOfBirth).toBe('FORMAT_INVALID')
    })

    it('should return MUST_BE_PAST for future date', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const result = validateStudentRegistration({
        ...validPayload,
        dateOfBirth: futureDate.toISOString().split('T')[0],
      })
      expect(result.fieldErrors.dateOfBirth).toBe('MUST_BE_PAST')
    })

    it('should accept valid past date', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        dateOfBirth: '2000-06-15',
      })
      expect(result.data?.dateOfBirth).toBe('2000-06-15')
    })
  })

  describe('deviceId validation', () => {
    it('should return LENGTH_INVALID when deviceId exceeds 255 chars', () => {
      const result = validateStudentRegistration({
        ...validPayload,
        deviceId: 'a'.repeat(256),
      })
      expect(result.fieldErrors.deviceId).toBe('LENGTH_INVALID')
    })
  })

  describe('null/undefined payload', () => {
    it('should return field errors for null payload', () => {
      const result = validateStudentRegistration(null)
      expect(result.data).toBeNull()
      expect(result.fieldErrors.firstName).toBe('LENGTH_INVALID')
      expect(result.fieldErrors.lastName).toBe('LENGTH_INVALID')
    })

    it('should return field errors for undefined payload', () => {
      const result = validateStudentRegistration(undefined)
      expect(result.data).toBeNull()
    })
  })
})

describe('validateStudentProfileUpdate', () => {
  it('should accept empty update (no fields)', () => {
    const result = validateStudentProfileUpdate({})
    expect(result.data).toEqual({})
    expect(Object.keys(result.fieldErrors)).toHaveLength(0)
  })

  it('should validate firstName when provided', () => {
    const result = validateStudentProfileUpdate({ firstName: 'A' })
    expect(result.fieldErrors.firstName).toBe('LENGTH_INVALID')
  })

  it('should accept valid firstName update', () => {
    const result = validateStudentProfileUpdate({ firstName: 'Maria' })
    expect(result.data?.firstName).toBe('Maria')
  })

  it('should validate email when provided', () => {
    const result = validateStudentProfileUpdate({ email: 'bad' })
    expect(result.fieldErrors.email).toBe('FORMAT_INVALID')
  })

  it('should accept clearing email with null', () => {
    const result = validateStudentProfileUpdate({ email: null })
    expect(result.data?.email).toBeUndefined()
  })

  it('should validate phone when provided', () => {
    const result = validateStudentProfileUpdate({ phone: '123' })
    expect(result.fieldErrors.phone).toBe('LENGTH_INVALID')
  })

  it('should validate dateOfBirth when provided', () => {
    const result = validateStudentProfileUpdate({ dateOfBirth: 'invalid' })
    expect(result.fieldErrors.dateOfBirth).toBe('FORMAT_INVALID')
  })
})
