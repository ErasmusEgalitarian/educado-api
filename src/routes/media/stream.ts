import { Request, Response, Router } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { canAccessMedia } from '../../application/media/media-access-service'
import { getFromS3 } from '../../infrastructure/storage/s3/s3-client'
import { getAccessTokenSecret } from '../../config/jwt'
import { MediaAsset } from '../../models'

type StreamAuthContext = {
  userId: string
  role: 'USER' | 'ADMIN'
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
    const role =
      decoded.role === 'ADMIN' ? ('ADMIN' as const) : ('USER' as const)
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

    if (!canAccessMedia(user, { ownerId: media.ownerId })) {
      return res.status(403).json({ code: 'FORBIDDEN' })
    }

    if (media.status === 'INACTIVE') {
      return res.status(403).json({ code: 'MEDIA_INACTIVE' })
    }

    const s3Response = await getFromS3(media.s3Key)
    res.setHeader('Content-Type', s3Response.contentType)
    s3Response.body.pipe(res)
    return
  } catch (error) {
    console.error('Stream media route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

export default router
