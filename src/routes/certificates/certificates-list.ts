import { Request, Response } from 'express'
import { Certificate, Course, User } from '../../models'
import { requireParam } from '../../utils/request-params'

export const certificatesList = async (req: Request, res: Response) => {
  try {
    const username = requireParam(req.params.username)

    // Find user by username
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const certificates = await Certificate.findAll({
      where: { userId: user.id },
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
