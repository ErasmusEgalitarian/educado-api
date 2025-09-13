import 'dotenv/config'
import { NextFunction, Request, Response } from 'express'
import jwt, { Secret } from 'jsonwebtoken'

// Authentication middleware
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  const secret: Secret = process.env.ACCESS_TOKEN_SECRET ?? ''

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403)
    req.body.user = user
    next()
  })
}
