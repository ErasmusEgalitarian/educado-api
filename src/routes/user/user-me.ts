import { Request, Response } from 'express'

export const userMe = async (_: Request, res: Response) => {
  res.json({ message: 'Hello User' })
}
