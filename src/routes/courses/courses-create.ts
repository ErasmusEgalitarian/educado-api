import { Request, Response } from 'express'
import { Course } from '../../models/course.model'

export async function coursesCreate(req: Request, res: Response) {
  try {
    const courseData = req.body

    // Ensure ID is provided (required field)
    if (!courseData.id) {
      return res.status(400).json({
        error: 'Course ID is required'
      })
    }

    // Create the course
    const course = await Course.create(courseData)

    res.status(201).json(course)
  } catch (error) {
    console.error('Error creating course:', error)

    if (error instanceof Error && error.name === 'SequelizeValidationError') {
      res.status(400).json({
        error: 'Validation error',
        message: error.message
      })
    } else {
      res.status(500).json({
        error: 'Failed to create course'
      })
    }
  }
}

export async function coursesUpdate(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const courseData = req.body

    const [updated] = await Course.update(courseData, {
      where: { id }
    })

    if (!updated) {
      return res.status(404).json({ error: 'Course not found' })
    }

    const course = await Course.findByPk(id)
    res.json(course)
  } catch (error) {
    console.error('Error updating course:', error)
    res.status(500).json({ error: 'Failed to update course' })
  }
}

export async function coursesDelete(req: Request, res: Response) {
  try {
    const id = req.params.id as string

    const deleted = await Course.destroy({
      where: { id }
    })

    if (!deleted) {
      return res.status(404).json({ error: 'Course not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting course:', error)
    res.status(500).json({ error: 'Failed to delete course' })
  }
}