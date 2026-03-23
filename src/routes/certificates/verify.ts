import { Router, Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import { verifyCertificate } from '../../application/certificates/certificate-pdf-service'

const router = Router()

router.get('/verify/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string
    const result = await verifyCertificate(code)
    return res.status(200).json(result)
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }
    console.error('Certificate verify error:', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

export const certificateVerificationRouter = router
