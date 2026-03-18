import { validateConfirmEmailVerificationInput } from '../email-verification-validation'

describe('validateConfirmEmailVerificationInput', () => {
  it('should return valid data for a 6-digit code', () => {
    const { data, fieldErrors } = validateConfirmEmailVerificationInput({
      code: '123456',
    })
    expect(data).not.toBeNull()
    expect(data!.code).toBe('123456')
    expect(Object.keys(fieldErrors)).toHaveLength(0)
  })

  it('should return REQUIRED when code is missing', () => {
    const { data, fieldErrors } = validateConfirmEmailVerificationInput({})
    expect(data).toBeNull()
    expect(fieldErrors.code).toBe('REQUIRED')
  })

  it('should return REQUIRED when code is empty string', () => {
    const { data, fieldErrors } = validateConfirmEmailVerificationInput({
      code: '',
    })
    expect(data).toBeNull()
    expect(fieldErrors.code).toBe('REQUIRED')
  })

  it('should return REQUIRED when code is whitespace only', () => {
    const { data, fieldErrors } = validateConfirmEmailVerificationInput({
      code: '   ',
    })
    expect(data).toBeNull()
    expect(fieldErrors.code).toBe('REQUIRED')
  })

  it('should return INVALID_CODE when code is not 6 digits', () => {
    const { data, fieldErrors } = validateConfirmEmailVerificationInput({
      code: '12345',
    })
    expect(data).toBeNull()
    expect(fieldErrors.code).toBe('INVALID_CODE')
  })

  it('should return INVALID_CODE when code contains letters', () => {
    const { data, fieldErrors } = validateConfirmEmailVerificationInput({
      code: '12345a',
    })
    expect(data).toBeNull()
    expect(fieldErrors.code).toBe('INVALID_CODE')
  })

  it('should return INVALID_CODE when code is 7 digits', () => {
    const { data, fieldErrors } = validateConfirmEmailVerificationInput({
      code: '1234567',
    })
    expect(data).toBeNull()
    expect(fieldErrors.code).toBe('INVALID_CODE')
  })

  it('should handle null payload', () => {
    const { data, fieldErrors } = validateConfirmEmailVerificationInput(null)
    expect(data).toBeNull()
    expect(fieldErrors.code).toBe('REQUIRED')
  })

  it('should handle undefined payload', () => {
    const { data, fieldErrors } =
      validateConfirmEmailVerificationInput(undefined)
    expect(data).toBeNull()
    expect(fieldErrors.code).toBe('REQUIRED')
  })

  it('should trim whitespace from code', () => {
    const { data } = validateConfirmEmailVerificationInput({
      code: ' 123456 ',
    })
    expect(data).not.toBeNull()
    expect(data!.code).toBe('123456')
  })

  it('should return REQUIRED when code is non-string type', () => {
    const { data, fieldErrors } = validateConfirmEmailVerificationInput({
      code: 123456,
    })
    expect(data).toBeNull()
    expect(fieldErrors.code).toBe('REQUIRED')
  })

  it('should accept code with leading zeros', () => {
    const { data } = validateConfirmEmailVerificationInput({
      code: '000001',
    })
    expect(data).not.toBeNull()
    expect(data!.code).toBe('000001')
  })
})
