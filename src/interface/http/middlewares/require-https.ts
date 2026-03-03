import { NextFunction, Request, Response } from 'express'

export const requireHttpsInProduction = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV !== 'production') {
    return next()
  }

  if (req.secure || req.header('x-forwarded-proto') === 'https') {
    return next()
  }

  return res.status(403).json({ code: 'HTTPS_REQUIRED' })
}
