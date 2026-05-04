import { Request, Response, Router } from 'express'
import multer from 'multer'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import {
  abortChunkedUpload,
  completeChunkedUpload,
  initChunkedUpload,
  uploadMedia,
  uploadMediaPart,
} from '../../application/media/media-service'
import { validateVideoType } from '../../application/media/media-validation'

const router = Router()

// Used by the legacy direct-upload endpoint. Stays small to avoid buffering
// huge files in memory when the whole-file path is exercised in dev.
const directUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
})

// Each chunked-upload part is bounded by the client-side chunk size (50 MB)
// plus a small overhead for multipart/form-data framing.
const partUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 },
})

// Legacy direct-upload endpoint. Kept for backward compatibility while clients
// migrate to the chunked flow below. Subject to the reverse-proxy body limit
// (Cloudflare Free = 100 MB).
router.post(
  '/videos',
  directUpload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const file = req.file

      if (!file) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: { file: 'REQUIRED' },
        })
      }

      if (!validateVideoType(file.mimetype)) {
        return res.status(422).json({ code: 'INVALID_VIDEO_TYPE' })
      }

      const { userId } = getAuthContext(res)
      const media = await uploadMedia({
        ownerId: userId,
        kind: 'video',
        file,
      })

      return res.status(201).json(media)
    } catch (error) {
      console.error('Upload video route error', error)
      return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
    }
  }
)

router.post('/videos/init', async (req: Request, res: Response) => {
  try {
    const filename =
      typeof req.body?.filename === 'string' ? req.body.filename : ''
    const contentType =
      typeof req.body?.contentType === 'string' ? req.body.contentType : ''
    const size = typeof req.body?.size === 'number' ? req.body.size : NaN

    const fieldErrors: Record<string, string> = {}
    if (!filename) fieldErrors.filename = 'REQUIRED'
    if (!contentType) fieldErrors.contentType = 'REQUIRED'
    if (!Number.isFinite(size)) fieldErrors.size = 'REQUIRED'
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(422).json({ code: 'VALIDATION_ERROR', fieldErrors })
    }

    if (!validateVideoType(contentType)) {
      return res.status(422).json({ code: 'INVALID_VIDEO_TYPE' })
    }

    const { userId } = getAuthContext(res)
    const result = await initChunkedUpload({
      ownerId: userId,
      kind: 'video',
      filename,
      contentType,
      size,
    })

    if ('error' in result) {
      return res.status(422).json({ code: result.error })
    }

    return res.status(201).json(result)
  } catch (error) {
    console.error('Init video upload route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.post(
  '/videos/:id/parts/:partNumber',
  partUpload.single('chunk'),
  async (req: Request, res: Response) => {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : ''
      const partNumber = Number.parseInt(req.params.partNumber as string, 10)
      const file = req.file

      if (!id) {
        return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
      }
      if (!Number.isInteger(partNumber) || partNumber < 1) {
        return res.status(400).json({ code: 'INVALID_PART_NUMBER' })
      }
      if (!file) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: { chunk: 'REQUIRED' },
        })
      }

      const { userId } = getAuthContext(res)
      const result = await uploadMediaPart({
        id,
        ownerId: userId,
        kind: 'video',
        partNumber,
        body: file.buffer,
      })

      if ('error' in result && result.error === 'NOT_FOUND') {
        return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
      }
      if ('error' in result && result.error === 'NOT_PENDING') {
        return res.status(409).json({ code: 'NOT_PENDING' })
      }
      if ('error' in result && result.error === 'INVALID_PART_NUMBER') {
        return res.status(400).json({ code: 'INVALID_PART_NUMBER' })
      }

      return res.status(200).json(result)
    } catch (error) {
      console.error('Upload video part route error', error)
      return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
    }
  }
)

router.post('/videos/:id/complete', async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : ''
    if (!id) {
      return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
    }

    const rawParts = Array.isArray(req.body?.parts) ? req.body.parts : []
    const parts: { partNumber: number; etag: string }[] = []
    for (const p of rawParts) {
      if (p && typeof p.partNumber === 'number' && typeof p.etag === 'string') {
        parts.push({ partNumber: p.partNumber, etag: p.etag })
      }
    }
    if (parts.length === 0) {
      return res
        .status(422)
        .json({ code: 'VALIDATION_ERROR', fieldErrors: { parts: 'REQUIRED' } })
    }

    const { userId } = getAuthContext(res)
    const result = await completeChunkedUpload({
      id,
      ownerId: userId,
      kind: 'video',
      parts,
    })

    if ('error' in result && result.error === 'NOT_FOUND') {
      return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
    }
    if ('error' in result && result.error === 'OBJECT_MISSING') {
      return res.status(409).json({ code: 'OBJECT_MISSING' })
    }
    if ('error' in result && result.error === 'INVALID_SIZE') {
      return res.status(422).json({ code: 'INVALID_SIZE' })
    }
    if ('error' in result && result.error === 'NO_PARTS') {
      return res.status(422).json({ code: 'NO_PARTS' })
    }
    if ('error' in result && result.error === 'NOT_PENDING') {
      return res.status(409).json({ code: 'NOT_PENDING' })
    }

    return res.status(200).json(result.media)
  } catch (error) {
    console.error('Complete video upload route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.post('/videos/:id/abort', async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : ''
    if (!id) {
      return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
    }

    const { userId } = getAuthContext(res)
    const result = await abortChunkedUpload({
      id,
      ownerId: userId,
      kind: 'video',
    })

    if ('error' in result && result.error === 'NOT_FOUND') {
      return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Abort video upload route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

export default router
