import { Request, Response } from 'express'
import { Section } from '../../models/section.model'

export async function sectionsList(_req: Request, res: Response) {
  try {
    const sections = await Section.findAll()
    res.json(sections)
  } catch (error) {
    console.error('Error fetching sections:', error)
    res.status(500).json({ error: 'Failed to fetch sections' })
  }
}

export async function sectionsGetById(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const section = await Section.findByPk(id)
    if (!section) {
      return res.status(404).json({ error: 'Section not found' })
    }
    res.json(section)
  } catch (error) {
    console.error('Error fetching section:', error)
    res.status(500).json({ error: 'Failed to fetch section' })
  }
}
