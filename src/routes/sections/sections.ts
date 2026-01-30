import { Router } from 'express'
import { Request, Response } from 'express'
import { Section, Activity } from '../../models'

export const sectionsRouter = Router()

// GET /sections/course/:courseId - Get all sections for a course
sectionsRouter.get('/course/:courseId', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params
    const sections = await Section.findAll({
      where: { courseId },
      order: [['order', 'ASC']],
      include: [
        {
          model: Activity,
          as: 'activities',
          order: [['order', 'ASC']]
        }
      ]
    })
    res.json(sections)
  } catch (error) {
    console.error('Error fetching sections:', error)
    res.status(500).json({ error: 'Failed to fetch sections' })
  }
})

// POST /sections - Create a new section
sectionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const sectionData = req.body

    if (!sectionData.id) {
      return res.status(400).json({ error: 'Section ID is required' })
    }

    const section = await Section.create(sectionData)
    res.status(201).json(section)
  } catch (error) {
    console.error('Error creating section:', error)
    res.status(500).json({ error: 'Failed to create section' })
  }
})

// PUT /sections/:id - Update a section
sectionsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const [updated] = await Section.update(req.body, {
      where: { id }
    })

    if (!updated) {
      return res.status(404).json({ error: 'Section not found' })
    }

    const section = await Section.findByPk(id)
    res.json(section)
  } catch (error) {
    console.error('Error updating section:', error)
    res.status(500).json({ error: 'Failed to update section' })
  }
})

// DELETE /sections/:id - Delete a section
sectionsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const deleted = await Section.destroy({
      where: { id }
    })

    if (!deleted) {
      return res.status(404).json({ error: 'Section not found' })
    }

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting section:', error)
    res.status(500).json({ error: 'Failed to delete section' })
  }
})