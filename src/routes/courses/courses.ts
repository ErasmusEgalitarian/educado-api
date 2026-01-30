import { Router } from 'express'
import { coursesGet, coursesList } from './courses-get'
import { coursesCreate, coursesUpdate, coursesDelete } from './courses-create'

export const coursesRouter = Router()

// GET /courses - List all courses (without sections for performance)
coursesRouter.get('/', coursesList)

// GET /courses/:id - Get single course with full nested sections and activities
coursesRouter.get('/:id', coursesGet)

// POST /courses - Create a new course
coursesRouter.post('/', coursesCreate)

// PUT /courses/:id - Update an existing course
coursesRouter.put('/:id', coursesUpdate)

// DELETE /courses/:id - Delete a course
coursesRouter.delete('/:id', coursesDelete)
