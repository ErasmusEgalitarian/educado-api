import 'dotenv/config'
import { Router } from 'express'
import { userMe } from './user-me'

export const userRouter = Router()

userRouter.post('/me', userMe)
