import { Router, Request, Response } from 'express'
import { AppError } from '../../application/common/app-error'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { requireRole } from '../../interface/http/middlewares/require-role'
import {
  listStudentCertificates,
  issueCertificateWithPdf,
} from '../../application/certificates/certificate-pdf-service'
import { getFromS3 } from '../../infrastructure/storage/s3/s3-client'
import { Certificate } from '../../models/index'

const router = Router()

const handleError = (_req: Request, res: Response, error: unknown) => {
  const requestId =
    typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ ...error.payload, requestId })
  }

  const unknownError = error instanceof Error ? error : null
  console.error('Certificate error:', unknownError?.message ?? error)

  return res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    requestId,
    ...(process.env.NODE_ENV !== 'production' && unknownError?.message
      ? { detail: unknownError.message }
      : {}),
  })
}

router.use(requireRole('STUDENT'))

router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const certificates = await listStudentCertificates(userId)
    return res.status(200).json({ certificates })
  } catch (error) {
    return handleError(req, res, error)
  }
})

router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { userId } = getAuthContext(res)
    const certId = req.params.id as string

    const cert = await Certificate.findOne({
      where: { id: certId, userId },
    })

    if (!cert) {
      throw new AppError(404, { code: 'CERTIFICATE_NOT_FOUND' })
    }

    // Generate PDF if not already generated
    if (!cert.pdfS3Key) {
      await issueCertificateWithPdf(userId, cert.courseId)
      await cert.reload()
    }

    if (!cert.pdfS3Key) {
      throw new AppError(500, { code: 'PDF_GENERATION_FAILED' })
    }

    const { body, contentType } = await getFromS3(cert.pdfS3Key)

    res.setHeader('Content-Type', contentType)
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificado-${cert.verificationCode ?? cert.id}.pdf"`
    )
    ;(body as NodeJS.ReadableStream).pipe(res)
  } catch (error) {
    if (!res.headersSent) {
      return handleError(req, res, error)
    }
  }
})

export const studentCertificatesRouter = router
