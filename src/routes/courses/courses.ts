import { Router } from 'express'
import { coursesGet, coursesList } from './courses-get'
import {
  coursesActivate,
  coursesCreate,
  coursesDeactivate,
  coursesDelete,
  coursesUpdate,
} from './courses-create'
import { requireAuth } from '../../interface/http/middlewares/auth-jwt'

export const coursesRouter = Router()

coursesRouter.use(requireAuth)

// GET /courses - List all courses (without sections for performance)
coursesRouter.get('/', coursesList)

// GET /courses/:id - Get single course with full nested sections and activities
coursesRouter.get('/:id', coursesGet)

// POST /courses - Create a new course
coursesRouter.post('/', coursesCreate)

// PUT /courses/:id - Update an existing course
coursesRouter.put('/:id', coursesUpdate)

// POST /courses/:id/activate - Activate a course
coursesRouter.post('/:id/activate', coursesActivate)

// POST /courses/:id/deactivate - Deactivate a course
coursesRouter.post('/:id/deactivate', coursesDeactivate)

// DELETE /courses/:id - Delete a course
coursesRouter.delete('/:id', coursesDelete)
