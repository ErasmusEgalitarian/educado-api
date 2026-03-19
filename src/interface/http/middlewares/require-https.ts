import { NextFunction, Request, Response } from 'express'

const isHttpsRequest = (req: Request): boolean => {
  if (req.secure || req.header('x-forwarded-proto') === 'https') {
    return true
  }

  // Cloudflare envia Cf-Visitor: {"scheme":"https"} mesmo quando
  // um proxy intermediario (Traefik/Coolify) sobrescreve X-Forwarded-Proto.
  const cfVisitor = req.header('cf-visitor')
  if (cfVisitor) {
    try {
      return JSON.parse(cfVisitor).scheme === 'https'
    } catch {
      return false
    }
  }

  return false
}

export const requireHttpsInProduction = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV !== 'production') {
    return next()
  }

  if (isHttpsRequest(req)) {
    return next()
  }

  return res.status(403).json({ code: 'HTTPS_REQUIRED' })
}
