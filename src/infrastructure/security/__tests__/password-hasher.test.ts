import { hashPassword, verifyPassword } from '../password-hasher'

describe('hashPassword', () => {
  it('should return a string', async () => {
    const hash = await hashPassword('mypassword')
    expect(typeof hash).toBe('string')
  })

  it('should return a hash different from the input', async () => {
    const hash = await hashPassword('mypassword')
    expect(hash).not.toBe('mypassword')
  })

  it('should produce different hashes for the same input (salt)', async () => {
    const hash1 = await hashPassword('mypassword')
    const hash2 = await hashPassword('mypassword')
    expect(hash1).not.toBe(hash2)
  })

  it('should produce a bcrypt-formatted hash', async () => {
    const hash = await hashPassword('mypassword')
    expect(hash).toMatch(/^\$2[aby]?\$\d{2}\$/)
  })
})

describe('verifyPassword', () => {
  it('should return true for correct password', async () => {
    const hash = await hashPassword('mypassword')
    const result = await verifyPassword('mypassword', hash)
    expect(result).toBe(true)
  })

  it('should return false for wrong password', async () => {
    const hash = await hashPassword('mypassword')
    const result = await verifyPassword('wrongpassword', hash)
    expect(result).toBe(false)
  })

  it('should return false for empty password against a hash', async () => {
    const hash = await hashPassword('mypassword')
    const result = await verifyPassword('', hash)
    expect(result).toBe(false)
  })

  it('should handle passwords with special characters', async () => {
    const password = 'p@$$w0rd!#%&*'
    const hash = await hashPassword(password)
    expect(await verifyPassword(password, hash)).toBe(true)
    expect(await verifyPassword('different', hash)).toBe(false)
  })
})
