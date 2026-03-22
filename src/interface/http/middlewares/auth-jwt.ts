import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { getAccessTokenSecret } from '../../../config/jwt'

type AuthContext = {
  userId: string
  role: 'USER' | 'ADMIN' | 'STUDENT'
}

export const getAuthContext = (res: Response): AuthContext => {
  return res.locals.auth as AuthContext
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null

  if (!token) {
    return res.status(401).json({ code: 'UNAUTHORIZED' })
  }

  let secret = ''
  try {
    secret = getAccessTokenSecret()
  } catch {
    return res.status(500).json({ code: 'MISSING_ACCESS_TOKEN_SECRET' })
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload

    const userId = typeof decoded.sub === 'string' ? decoded.sub : ''
    const VALID_ROLES = ['ADMIN', 'STUDENT', 'USER'] as const
    const role = VALID_ROLES.includes(
      decoded.role as (typeof VALID_ROLES)[number]
    )
      ? (decoded.role as AuthContext['role'])
      : 'USER'

    if (!userId) {
      return res.status(401).json({ code: 'UNAUTHORIZED' })
    }

    res.locals.auth = {
      userId,
      role,
    } as AuthContext

    return next()
  } catch {
    return res.status(401).json({ code: 'UNAUTHORIZED' })
  }
}
