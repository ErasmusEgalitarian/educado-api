import 'dotenv/config'
import { Router } from 'express'
import { userLogin } from './user-login'
import { userMe } from './user-me'

export const userRouter = Router()

userRouter.post('/login', userLogin)
userRouter.post('/me', userMe)
