import PDFDocument from 'pdfkit'
import { nanoid } from 'nanoid'
import { AppError } from '../common/app-error'
import { Certificate, Course, User } from '../../models/index'
import { uploadToS3 } from '../../infrastructure/storage/s3/s3-client'

const VERIFICATION_BASE_URL =
  process.env.CERTIFICATE_VERIFICATION_URL ||
  'https://educado.com/certificates/verify'

const generateVerificationCode = (): string => {
  return nanoid(12)
}

export const generateCertificatePdf = async (data: {
  userName: string
  courseName: string
  totalHours: string
  completedAt: Date
  instructorName: string | null
  verificationCode: string
}): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50,
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(14).text('EDUCADO', { align: 'center' })
    doc.moveDown(2)

    // Title
    doc.fontSize(28).text('CERTIFICADO DE CONCLUSÃO', { align: 'center' })
    doc.moveDown(2)

    // Body
    doc.fontSize(14).text('Certificamos que', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(22).text(data.userName, { align: 'center' })
    doc.moveDown(1)
    doc.fontSize(14).text('concluiu com êxito o curso', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(20).text(data.courseName, { align: 'center' })
    doc.moveDown(1)

    doc
      .fontSize(12)
      .text(`Carga horária: ${data.totalHours} | Modalidade: EAD`, {
        align: 'center',
      })
    doc.moveDown(0.5)

    const dateStr = data.completedAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    doc.text(`Data de conclusão: ${dateStr}`, { align: 'center' })
    doc.moveDown(2)

    if (data.instructorName) {
      doc.text(`Instrutor: ${data.instructorName}`, { align: 'center' })
      doc.moveDown(1)
    }

    // Verification
    doc.fontSize(10).text(`Código de verificação: ${data.verificationCode}`, {
      align: 'center',
    })
    doc.text(
      `Verifique em: ${VERIFICATION_BASE_URL}/${data.verificationCode}`,
      {
        align: 'center',
      }
    )

    doc.end()
  })
}

export const issueCertificateWithPdf = async (
  userId: string,
  courseId: string
) => {
  const certificate = await Certificate.findOne({
    where: { userId, courseId },
  })

  if (!certificate) {
    throw new AppError(404, { code: 'CERTIFICATE_NOT_FOUND' })
  }

  if (certificate.pdfS3Key) {
    return certificate
  }

  const verificationCode =
    certificate.verificationCode || generateVerificationCode()

  const course = await Course.findByPk(courseId)

  const pdfBuffer = await generateCertificatePdf({
    userName: certificate.userName,
    courseName: certificate.courseName,
    totalHours: certificate.totalHours || course?.estimatedTime || 'N/A',
    completedAt: certificate.completedAt,
    instructorName: certificate.instructorName,
    verificationCode,
  })

  const s3Key = await uploadToS3(
    {
      buffer: pdfBuffer,
      originalname: `certificate-${verificationCode}.pdf`,
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
    },
    userId,
    'certificates'
  )

  await certificate.update({
    pdfS3Key: s3Key,
    verificationCode,
    instructorName:
      certificate.instructorName ??
      (course
        ? (await User.findByPk(course.ownerId, {
            attributes: ['firstName', 'lastName'],
          }))
          ? `${(await User.findByPk(course.ownerId))?.firstName ?? ''} ${(await User.findByPk(course.ownerId))?.lastName ?? ''}`.trim()
          : null
        : null),
    totalHours: certificate.totalHours ?? course?.estimatedTime ?? null,
  })

  return certificate
}

export const verifyCertificate = async (code: string) => {
  const certificate = await Certificate.findOne({
    where: { verificationCode: code },
  })

  if (!certificate) {
    throw new AppError(404, { code: 'CERTIFICATE_NOT_FOUND' })
  }

  return {
    id: certificate.id,
    userName: certificate.userName,
    courseName: certificate.courseName,
    totalSections: certificate.totalSections,
    completedAt: certificate.completedAt,
    totalHours: certificate.totalHours,
    verified: true,
  }
}

export const listStudentCertificates = async (userId: string) => {
  const certificates = await Certificate.findAll({
    where: { userId },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'imageMediaId'],
      },
    ],
    order: [['completedAt', 'DESC']],
  })

  return certificates.map((cert) => {
    const course = cert.get('course') as Course | null
    return {
      id: cert.id,
      courseId: cert.courseId,
      courseName: cert.courseName,
      userName: cert.userName,
      completedAt: cert.completedAt,
      totalSections: cert.totalSections,
      hasPdf: !!cert.pdfS3Key,
      verificationCode: cert.verificationCode,
      course: course
        ? {
            id: course.id,
            title: course.title,
            imageMediaId: course.imageMediaId,
          }
        : null,
    }
  })
}
