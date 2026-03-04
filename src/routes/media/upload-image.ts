import { Request, Response, Router } from 'express'
import multer from 'multer'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { uploadMedia } from '../../application/media/media-service'
import { validateImageType } from '../../application/media/media-validation'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

router.post(
  '/images',
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const file = req.file

      if (!file) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: { file: 'REQUIRED' },
        })
      }

      if (!validateImageType(file.mimetype)) {
        return res.status(422).json({ code: 'INVALID_IMAGE_TYPE' })
      }

      const { userId } = getAuthContext(res)
      const media = await uploadMedia({
        ownerId: userId,
        kind: 'image',
        file,
      })

      return res.status(201).json(media)
    } catch (error) {
      console.error('Upload image route error', error)
      return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
    }
  }
)

export default router
