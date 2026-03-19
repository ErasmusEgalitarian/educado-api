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

  // TODO: remover apos diagnosticar o 403
  console.warn(
    JSON.stringify({
      debug: 'HTTPS_REQUIRED_BLOCKED',
      secure: req.secure,
      xForwardedProto: req.header('x-forwarded-proto') ?? null,
      xForwardedFor: req.header('x-forwarded-for') ?? null,
      xForwardedSsl: req.header('x-forwarded-ssl') ?? null,
      host: req.header('host') ?? null,
      protocol: req.protocol,
    })
  )

  return res.status(403).json({ code: 'HTTPS_REQUIRED' })
}
