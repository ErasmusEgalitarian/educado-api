import { Request, Response, Router } from 'express'
import { ObjectId } from 'mongodb'
import { AppError } from '../../application/common/app-error'
import { canAccessMedia } from '../../application/media/media-access-service'
import { getMediaMetadata } from '../../application/media/media-metadata-service'
import { getMongoDb } from '../../infrastructure/storage/mongo/mongo-client'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'

type MediaImageRecord = {
  ownerId: string
  kind: 'image'
  status: 'ACTIVE' | 'INACTIVE'
}

const router = Router()

router.get('/images/:id', async (req: Request, res: Response) => {
  try {
    const mediaId = typeof req.params.id === 'string' ? req.params.id : ''

    if (!ObjectId.isValid(mediaId)) {
      return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
    }

    const media = await getMongoDb()
      .collection<MediaImageRecord>('media')
      .findOne({ _id: new ObjectId(mediaId), kind: 'image' })

    if (!media) {
      return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
    }

    const user = getAuthContext(res)
    if (!canAccessMedia(user, media)) {
      return res.status(403).json({ code: 'FORBIDDEN' })
    }

    if (media.status === 'INACTIVE') {
      return res.status(403).json({ code: 'MEDIA_INACTIVE' })
    }

    const metadata = await getMediaMetadata(mediaId)

    return res.status(200).json({
      _id: mediaId,
      ownerId: media.ownerId,
      kind: media.kind,
      title: metadata.title,
      altText: metadata.altText,
      description: metadata.description,
      streamUrl: metadata.streamUrl,
      status: media.status,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
    })
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    console.error('Get image metadata route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

export default router
