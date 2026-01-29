import { Request, Response } from 'express'
import { Certificate, User } from '../../models'

export const certificatesCreate = async (req: Request, res: Response) => {
  try {
    const { courseId, username, courseName, userName, totalSections } = req.body

    if (!courseId || !username || !courseName || !userName || !totalSections) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Find user by username
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      where: { userId: user.id, courseId },
    })

    if (existingCertificate) {
      return res.status(409).json({
        error: 'Certificate already exists for this course',
        certificate: existingCertificate,
      })
    }

    const certificate = await Certificate.create({
      courseId,
      userId: user.id,
      courseName,
      completedAt: new Date(),
      userName,
      totalSections,
    })

    res.status(201).json(certificate)
  } catch (error) {
    console.error('Error creating certificate:', error)
    res.status(500).json({ error: 'Failed to create certificate' })
  }
}
