import {
  normalizeEmail,
  validateCreateRegistrationInput,
  validateRegistrationProfileInput,
  validateLoginInput,
  validateRejectInput,
} from '../registration-validation'

describe('normalizeEmail', () => {
  it('should lowercase the email', () => {
    expect(normalizeEmail('User@Example.COM')).toBe('user@example.com')
  })

  it('should trim whitespace', () => {
    expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com')
  })

  it('should trim and lowercase combined', () => {
    expect(normalizeEmail('  USER@EXAMPLE.COM  ')).toBe('user@example.com')
  })
})

describe('validateCreateRegistrationInput', () => {
  const validInput = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password1',
    confirmPassword: 'password1',
  }

  describe('happy path', () => {
    it('should return data when all fields are valid', () => {
      const result = validateCreateRegistrationInput(validInput)
      expect(result.data).toEqual(validInput)
      expect(Object.keys(result.fieldErrors)).toHaveLength(0)
    })

    it('should trim whitespace from all fields', () => {
      const result = validateCreateRegistrationInput({
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: '  john@example.com  ',
        password: '  password1  ',
        confirmPassword: '  password1  ',
      })
      expect(result.data).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password1',
        confirmPassword: 'password1',
      })
    })
  })

  describe('required fields', () => {
    it('should return REQUIRED error when firstName is empty', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        firstName: '',
      })
      expect(result.data).toBeNull()
      expect(result.fieldErrors.firstName).toBe('REQUIRED')
    })

    it('should return REQUIRED error when lastName is empty', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        lastName: '',
      })
      expect(result.data).toBeNull()
      expect(result.fieldErrors.lastName).toBe('REQUIRED')
    })

    it('should return errors for all missing fields when payload is empty', () => {
      const result = validateCreateRegistrationInput({})
      expect(result.data).toBeNull()
      expect(result.fieldErrors.firstName).toBe('REQUIRED')
      expect(result.fieldErrors.lastName).toBe('REQUIRED')
      expect(result.fieldErrors.email).toBe('EMAIL_INVALID')
      expect(result.fieldErrors.password).toBe('PASSWORD_POLICY')
      expect(result.fieldErrors.confirmPassword).toBe('PASSWORD_MISMATCH')
    })

    it('should return errors when payload is null', () => {
      const result = validateCreateRegistrationInput(null)
      expect(result.data).toBeNull()
      expect(Object.keys(result.fieldErrors).length).toBeGreaterThan(0)
    })

    it('should return errors when payload is undefined', () => {
      const result = validateCreateRegistrationInput(undefined)
      expect(result.data).toBeNull()
      expect(Object.keys(result.fieldErrors).length).toBeGreaterThan(0)
    })
  })

  describe('email validation', () => {
    it('should return EMAIL_INVALID for email without @', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        email: 'invalid',
      })
      expect(result.fieldErrors.email).toBe('EMAIL_INVALID')
    })

    it('should return EMAIL_INVALID for email without domain', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        email: 'user@',
      })
      expect(result.fieldErrors.email).toBe('EMAIL_INVALID')
    })

    it('should return EMAIL_INVALID for email without TLD', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        email: 'user@domain',
      })
      expect(result.fieldErrors.email).toBe('EMAIL_INVALID')
    })

    it('should accept a valid email', () => {
      const result = validateCreateRegistrationInput(validInput)
      expect(result.fieldErrors.email).toBeUndefined()
    })
  })

  describe('password policy', () => {
    it('should return PASSWORD_POLICY for password shorter than 8 characters', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        password: 'short1',
        confirmPassword: 'short1',
      })
      expect(result.fieldErrors.password).toBe('PASSWORD_POLICY')
    })

    it('should return PASSWORD_POLICY for password with only digits', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        password: '12345678',
        confirmPassword: '12345678',
      })
      expect(result.fieldErrors.password).toBe('PASSWORD_POLICY')
    })

    it('should accept password with 8+ chars and at least one letter', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        password: 'abcdefgh',
        confirmPassword: 'abcdefgh',
      })
      expect(result.fieldErrors.password).toBeUndefined()
    })

    it('should accept password with mixed letters and digits', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        password: 'abc12345',
        confirmPassword: 'abc12345',
      })
      expect(result.fieldErrors.password).toBeUndefined()
    })
  })

  describe('confirmPassword', () => {
    it('should return PASSWORD_MISMATCH when passwords do not match', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        confirmPassword: 'different1',
      })
      expect(result.fieldErrors.confirmPassword).toBe('PASSWORD_MISMATCH')
    })

    it('should return PASSWORD_MISMATCH when confirmPassword is empty', () => {
      const result = validateCreateRegistrationInput({
        ...validInput,
        confirmPassword: '',
      })
      expect(result.fieldErrors.confirmPassword).toBe('PASSWORD_MISMATCH')
    })
  })

  describe('edge cases', () => {
    it('should treat non-string values as empty strings', () => {
      const result = validateCreateRegistrationInput({
        firstName: 123,
        lastName: null,
        email: undefined,
        password: true,
        confirmPassword: [],
      })
      expect(result.data).toBeNull()
      expect(result.fieldErrors.firstName).toBe('REQUIRED')
      expect(result.fieldErrors.lastName).toBe('REQUIRED')
    })
  })
})

describe('validateRegistrationProfileInput', () => {
  const validProfile = {
    motivations: 'A'.repeat(30),
    academicBackground: 'B'.repeat(20),
    professionalExperience: 'C'.repeat(20),
  }

  describe('happy path', () => {
    it('should return data when all fields meet minimum length', () => {
      const result = validateRegistrationProfileInput(validProfile)
      expect(result.data).toEqual(validProfile)
      expect(Object.keys(result.fieldErrors)).toHaveLength(0)
    })
  })

  describe('motivations', () => {
    it('should return LENGTH_INVALID when motivations is too short', () => {
      const result = validateRegistrationProfileInput({
        ...validProfile,
        motivations: 'A'.repeat(29),
      })
      expect(result.fieldErrors.motivations).toBe('LENGTH_INVALID')
    })

    it('should return LENGTH_INVALID when motivations exceeds max', () => {
      const result = validateRegistrationProfileInput({
        ...validProfile,
        motivations: 'A'.repeat(2001),
      })
      expect(result.fieldErrors.motivations).toBe('LENGTH_INVALID')
    })

    it('should accept motivations at exactly min length (30)', () => {
      const result = validateRegistrationProfileInput({
        ...validProfile,
        motivations: 'A'.repeat(30),
      })
      expect(result.fieldErrors.motivations).toBeUndefined()
    })

    it('should accept motivations at exactly max length (2000)', () => {
      const result = validateRegistrationProfileInput({
        ...validProfile,
        motivations: 'A'.repeat(2000),
      })
      expect(result.fieldErrors.motivations).toBeUndefined()
    })
  })

  describe('academicBackground', () => {
    it('should return LENGTH_INVALID when too short', () => {
      const result = validateRegistrationProfileInput({
        ...validProfile,
        academicBackground: 'B'.repeat(19),
      })
      expect(result.fieldErrors.academicBackground).toBe('LENGTH_INVALID')
    })

    it('should return LENGTH_INVALID when exceeds max (2000)', () => {
      const result = validateRegistrationProfileInput({
        ...validProfile,
        academicBackground: 'B'.repeat(2001),
      })
      expect(result.fieldErrors.academicBackground).toBe('LENGTH_INVALID')
    })
  })

  describe('professionalExperience', () => {
    it('should return LENGTH_INVALID when too short', () => {
      const result = validateRegistrationProfileInput({
        ...validProfile,
        professionalExperience: 'C'.repeat(19),
      })
      expect(result.fieldErrors.professionalExperience).toBe('LENGTH_INVALID')
    })

    it('should return LENGTH_INVALID when exceeds max (4000)', () => {
      const result = validateRegistrationProfileInput({
        ...validProfile,
        professionalExperience: 'C'.repeat(4001),
      })
      expect(result.fieldErrors.professionalExperience).toBe('LENGTH_INVALID')
    })

    it('should accept professionalExperience at exactly max length (4000)', () => {
      const result = validateRegistrationProfileInput({
        ...validProfile,
        professionalExperience: 'C'.repeat(4000),
      })
      expect(result.fieldErrors.professionalExperience).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should return errors for null payload', () => {
      const result = validateRegistrationProfileInput(null)
      expect(result.data).toBeNull()
      expect(result.fieldErrors.motivations).toBe('LENGTH_INVALID')
      expect(result.fieldErrors.academicBackground).toBe('LENGTH_INVALID')
      expect(result.fieldErrors.professionalExperience).toBe('LENGTH_INVALID')
    })

    it('should return multiple errors at once', () => {
      const result = validateRegistrationProfileInput({})
      expect(result.data).toBeNull()
      expect(Object.keys(result.fieldErrors)).toHaveLength(3)
    })
  })
})

describe('validateLoginInput', () => {
  const validLogin = {
    email: 'user@example.com',
    password: 'mypassword',
  }

  it('should return data for valid input', () => {
    const result = validateLoginInput(validLogin)
    expect(result.data).toEqual(validLogin)
    expect(Object.keys(result.fieldErrors)).toHaveLength(0)
  })

  it('should return EMAIL_INVALID for missing email', () => {
    const result = validateLoginInput({ password: 'mypassword' })
    expect(result.fieldErrors.email).toBe('EMAIL_INVALID')
  })

  it('should return EMAIL_INVALID for invalid email format', () => {
    const result = validateLoginInput({
      email: 'invalid',
      password: 'mypassword',
    })
    expect(result.fieldErrors.email).toBe('EMAIL_INVALID')
  })

  it('should return REQUIRED for missing password', () => {
    const result = validateLoginInput({ email: 'user@example.com' })
    expect(result.fieldErrors.password).toBe('REQUIRED')
  })

  it('should return errors for empty payload', () => {
    const result = validateLoginInput({})
    expect(result.data).toBeNull()
    expect(result.fieldErrors.email).toBe('EMAIL_INVALID')
    expect(result.fieldErrors.password).toBe('REQUIRED')
  })

  it('should trim email and password', () => {
    const result = validateLoginInput({
      email: '  user@example.com  ',
      password: '  mypassword  ',
    })
    expect(result.data?.email).toBe('user@example.com')
    expect(result.data?.password).toBe('mypassword')
  })
})

describe('validateRejectInput', () => {
  it('should return data when reason is provided', () => {
    const result = validateRejectInput({ reason: 'Not qualified' })
    expect(result.data).toEqual({ reason: 'Not qualified' })
    expect(Object.keys(result.fieldErrors)).toHaveLength(0)
  })

  it('should include notes when provided', () => {
    const result = validateRejectInput({
      reason: 'Not qualified',
      notes: 'See details',
    })
    expect(result.data).toEqual({
      reason: 'Not qualified',
      notes: 'See details',
    })
  })

  it('should omit notes when empty', () => {
    const result = validateRejectInput({ reason: 'Not qualified', notes: '' })
    expect(result.data).toEqual({ reason: 'Not qualified' })
  })

  it('should return REQUIRED when reason is missing', () => {
    const result = validateRejectInput({})
    expect(result.data).toBeNull()
    expect(result.fieldErrors.reason).toBe('REQUIRED')
  })

  it('should return REQUIRED when reason is empty string', () => {
    const result = validateRejectInput({ reason: '' })
    expect(result.data).toBeNull()
    expect(result.fieldErrors.reason).toBe('REQUIRED')
  })
})
