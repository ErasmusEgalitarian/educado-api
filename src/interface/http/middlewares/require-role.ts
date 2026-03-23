import { Request, Response, NextFunction } from 'express'
import { requireAuth, getAuthContext } from './auth-jwt'

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, (err?: unknown) => {
      if (err) {
        return next(err)
      }

      // If requireAuth sent a response (401), res.headersSent will be true
      if (res.headersSent) {
        return
      }

      const auth = getAuthContext(res)

      if (!allowedRoles.includes(auth.role)) {
        return res.status(403).json({ code: 'FORBIDDEN' })
      }

      return next()
    })
  }
}
