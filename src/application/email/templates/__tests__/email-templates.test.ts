import { emailVerificationCodeTemplate } from '../email-verification-code'
import { passwordResetCodeTemplate } from '../password-reset-code'
import { registrationApprovedTemplate } from '../registration-approved'

describe('emailVerificationCodeTemplate', () => {
  it('should return subject and html', () => {
    const result = emailVerificationCodeTemplate({ code: '1234' })
    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('html')
    expect(typeof result.subject).toBe('string')
    expect(typeof result.html).toBe('string')
  })

  it('should have non-empty subject', () => {
    const result = emailVerificationCodeTemplate({ code: '1234' })
    expect(result.subject.length).toBeGreaterThan(0)
  })

  it('should include the code in the html', () => {
    const result = emailVerificationCodeTemplate({ code: '9876' })
    expect(result.html).toContain('9876')
  })

  it('should include firstName in greeting when provided', () => {
    const result = emailVerificationCodeTemplate({ firstName: 'Maria', code: '1234' })
    expect(result.html).toContain('Maria')
  })

  it('should use generic greeting when firstName is undefined', () => {
    const result = emailVerificationCodeTemplate({ code: '1234' })
    expect(result.html).toContain('Olá!')
    expect(result.html).not.toContain('Olá, !')
  })

  it('should use generic greeting when firstName is empty string', () => {
    const result = emailVerificationCodeTemplate({ firstName: '', code: '1234' })
    expect(result.html).toContain('Olá!')
  })

  it('should use generic greeting when firstName is whitespace only', () => {
    const result = emailVerificationCodeTemplate({ firstName: '   ', code: '1234' })
    expect(result.html).toContain('Olá!')
  })
})

describe('passwordResetCodeTemplate', () => {
  it('should return subject and html', () => {
    const result = passwordResetCodeTemplate({ code: '5678' })
    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('html')
  })

  it('should have non-empty subject', () => {
    const result = passwordResetCodeTemplate({ code: '5678' })
    expect(result.subject.length).toBeGreaterThan(0)
  })

  it('should include the code in the html', () => {
    const result = passwordResetCodeTemplate({ code: '4321' })
    expect(result.html).toContain('4321')
  })

  it('should include firstName in greeting when provided', () => {
    const result = passwordResetCodeTemplate({ firstName: 'João', code: '5678' })
    expect(result.html).toContain('João')
  })

  it('should use generic greeting when firstName is missing', () => {
    const result = passwordResetCodeTemplate({ code: '5678' })
    expect(result.html).toContain('Olá!')
  })

  it('should handle whitespace-only firstName gracefully', () => {
    const result = passwordResetCodeTemplate({ firstName: '  ', code: '5678' })
    expect(result.html).toContain('Olá!')
  })
})

describe('registrationApprovedTemplate', () => {
  it('should return subject and html', () => {
    const result = registrationApprovedTemplate({})
    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('html')
  })

  it('should have non-empty subject', () => {
    const result = registrationApprovedTemplate({})
    expect(result.subject.length).toBeGreaterThan(0)
  })

  it('should include firstName in greeting when provided', () => {
    const result = registrationApprovedTemplate({ firstName: 'Ana' })
    expect(result.html).toContain('Ana')
  })

  it('should use generic greeting when firstName is undefined', () => {
    const result = registrationApprovedTemplate({})
    expect(result.html).toContain('Olá!')
  })

  it('should use generic greeting when firstName is empty', () => {
    const result = registrationApprovedTemplate({ firstName: '' })
    expect(result.html).toContain('Olá!')
  })

  it('should handle whitespace-only firstName gracefully', () => {
    const result = registrationApprovedTemplate({ firstName: '   ' })
    expect(result.html).toContain('Olá!')
  })
})
