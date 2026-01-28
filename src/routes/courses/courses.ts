import { Router } from 'express'
import { coursesGet, coursesList } from './courses-get'

export const coursesRouter = Router()

// GET /courses - List all courses (without sections for performance)
coursesRouter.get('/', coursesList)

// GET /courses/:id - Get single course with full nested sections and activities
coursesRouter.get('/:id', coursesGet)
