import { Request, Response } from 'express'
import { Certificate } from '../../models'

export const certificatesCreate = async (req: Request, res: Response) => {
  try {
    const { courseId, deviceId, courseName, userName, totalSections } = req.body

    if (!courseId || !deviceId || !courseName || !userName || !totalSections) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      where: { deviceId, courseId },
    })

    if (existingCertificate) {
      return res.status(409).json({
        error: 'Certificate already exists for this course',
        certificate: existingCertificate,
      })
    }

    const certificate = await Certificate.create({
      courseId,
      deviceId,
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
