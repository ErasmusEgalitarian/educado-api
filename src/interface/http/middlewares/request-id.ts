import { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const incomingRequestId = req.header('x-request-id')
  const requestId =
    incomingRequestId && incomingRequestId.trim() !== ''
      ? incomingRequestId
      : randomUUID()

  res.setHeader('x-request-id', requestId)
  res.locals.requestId = requestId

  const start = Date.now()
  res.on('finish', () => {
    const durationMs = Date.now() - start
    console.info(
      JSON.stringify({
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      })
    )
  })

  next()
}
