/* eslint-disable prettier/prettier */
import { Request, Response } from 'express'
import { Section } from '../../models/section.model'

export async function sectionsCreate(req: Request, res: Response) {
  try {
    const sectionData = req.body
    const section = await Section.create(sectionData)
    res.status(201).json(section)
  } catch (error) {
    console.error('Error creating section:', error)
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
      res.status(400).json({
        error: 'Validation error',
        message: error.message,
      })
    } else {
      res.status(500).json({
        error: 'Failed to create section',
      })
    }
  }
}

export async function sectionsUpdate(req: Request, res: Response) {
    try {
        const id = req.params.id as string
        const sectionData = req.body
        const [updated] = await Section.update(sectionData, {
            where: { id },
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
}

export async function sectionsDelete(req: Request, res: Response) {
    try {
        const id = req.params.id as string
        const deleted = await Section.destroy({
            where: { id },
        })
        
        if (!deleted) {
            return res.status(404).json({ error: 'Section not found' })
        }
        res.status(204).send()
    }
    catch (error) {
        console.error('Error deleting section:', error)
        res.status(500).json({ error: 'Failed to delete section' })
    }
}