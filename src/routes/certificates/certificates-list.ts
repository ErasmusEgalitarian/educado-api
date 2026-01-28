import { Request, Response } from 'express'
import { Certificate, Course } from '../../models'
import { requireParam } from '../../utils/request-params'

export const certificatesList = async (req: Request, res: Response) => {
  try {
    const deviceId = requireParam(req.params.deviceId)

    const certificates = await Certificate.findAll({
      where: { deviceId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'imageUrl'],
        },
      ],
      order: [['completedAt', 'DESC']],
    })

    res.json(certificates)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Missing required parameter')
    ) {
      return res.status(400).json({ error: error.message })
    }
    console.error('Error fetching certificates:', error)
    res.status(500).json({ error: 'Failed to fetch certificates' })
  }
}
