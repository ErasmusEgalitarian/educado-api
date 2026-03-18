import { AppError } from '../app-error'

describe('AppError', () => {
  it('should set statusCode from constructor', () => {
    const error = new AppError(400, { code: 'BAD_REQUEST' })
    expect(error.statusCode).toBe(400)
  })

  it('should set payload from constructor', () => {
    const payload = { code: 'NOT_FOUND', detail: 'missing' }
    const error = new AppError(404, payload)
    expect(error.payload).toEqual(payload)
  })

  it('should be an instance of Error', () => {
    const error = new AppError(500, { code: 'INTERNAL' })
    expect(error).toBeInstanceOf(Error)
  })

  it('should use payload.code as the Error message', () => {
    const error = new AppError(409, { code: 'CONFLICT' })
    expect(error.message).toBe('CONFLICT')
  })

  it('should default message to APP_ERROR when code is not in payload', () => {
    const error = new AppError(500, { detail: 'something' })
    expect(error.message).toBe('APP_ERROR')
  })

  it('should allow accessing code from payload', () => {
    const error = new AppError(422, { code: 'VALIDATION_ERROR', fieldErrors: {} })
    expect(error.payload.code).toBe('VALIDATION_ERROR')
  })

  it('should preserve different status codes', () => {
    expect(new AppError(201, { code: 'CREATED' }).statusCode).toBe(201)
    expect(new AppError(403, { code: 'FORBIDDEN' }).statusCode).toBe(403)
    expect(new AppError(429, { code: 'RATE_LIMITED' }).statusCode).toBe(429)
  })
})
