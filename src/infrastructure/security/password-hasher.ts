import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export const hashPassword = async (plainTextPassword: string): Promise<string> => {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS)
}

export const verifyPassword = async (
  plainTextPassword: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(plainTextPassword, passwordHash)
}
