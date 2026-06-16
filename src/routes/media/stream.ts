import { Request, Response, Router } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { canAccessMedia } from '../../application/media/media-access-service'
import {
  getFromS3,
  headS3Object,
} from '../../infrastructure/storage/s3/s3-client'
import { getAccessTokenSecret } from '../../config/jwt'
import { MediaAsset } from '../../models'

type StreamAuthContext = {
  userId: string
  role: 'USER' | 'ADMIN' | 'STUDENT'
}

function getStreamAuth(req: Request): StreamAuthContext | null {
  // Try Authorization header first
  const authorization = req.headers.authorization
  let token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null

  // Fall back to query param
  if (!token) {
    const queryToken = req.query.token
    token = typeof queryToken === 'string' ? queryToken : null
  }

  if (!token) return null

  try {
    const secret = getAccessTokenSecret()
    const decoded = jwt.verify(token, secret) as JwtPayload
    const userId = typeof decoded.sub === 'string' ? decoded.sub : ''
    const VALID_ROLES = ['ADMIN', 'STUDENT', 'USER'] as const
    const role = VALID_ROLES.includes(
      decoded.role as (typeof VALID_ROLES)[number]
    )
      ? (decoded.role as StreamAuthContext['role'])
      : 'USER'
    if (!userId) return null
    return { userId, role }
  } catch {
    return null
  }
}

const router = Router()

router.get('/:id/stream', async (req: Request, res: Response) => {
  try {
    const mediaId = typeof req.params.id === 'string' ? req.params.id : ''
    if (!mediaId) {
      return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
    }

    const media = await MediaAsset.findByPk(mediaId)
    if (!media) {
      return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
    }

    const user = getStreamAuth(req)
    if (!user) {
      return res.status(401).json({ code: 'UNAUTHORIZED' })
    }

    // Students can access any active media (course content)
    // Owners and admins can access their own media
    if (
      user.role !== 'STUDENT' &&
      !canAccessMedia(user, { ownerId: media.ownerId })
    ) {
      return res.status(403).json({ code: 'FORBIDDEN' })
    }

    if (media.status !== 'ACTIVE') {
      return res.status(403).json({ code: 'MEDIA_NOT_AVAILABLE' })
    }

    const meta = await headS3Object(media.s3Key)
    if (!meta) {
      return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
    }
    const fileSize = meta.size
    const contentType = meta.contentType

    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Content-Type', contentType)

    const rangeHeader = req.headers.range
    if (rangeHeader && fileSize > 0) {
      const [startStr, endStr] = rangeHeader.replace(/bytes=/, '').split('-')
      const start = parseInt(startStr, 10)
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1
      const clampedEnd = Math.min(end, fileSize - 1)
      const chunkSize = clampedEnd - start + 1

      res.setHeader('Content-Range', `bytes ${start}-${clampedEnd}/${fileSize}`)
      res.setHeader('Content-Length', String(chunkSize))
      res.status(206)
      const s3Response = await getFromS3(
        media.s3Key,
        `bytes=${start}-${clampedEnd}`
      )
      s3Response.body.pipe(res)
    } else {
      if (fileSize > 0) res.setHeader('Content-Length', String(fileSize))
      res.status(200)
      const s3Response = await getFromS3(media.s3Key)
      s3Response.body.pipe(res)
    }
    return
  } catch (error) {
    console.error('Stream media route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

export default router
