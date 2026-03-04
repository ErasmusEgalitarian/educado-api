import { Router } from 'express'
import { myCoursesList } from '../courses/courses-get'
import { requireAuth } from '../../interface/http/middlewares/auth-jwt'

export const meRouter = Router()

meRouter.use(requireAuth)

// GET /me/courses - List courses owned by the authenticated user
meRouter.get('/courses', myCoursesList)
