import { Request, Response, Router } from 'express'
import { ObjectId } from 'mongodb'
import { canAccessMedia } from '../../application/media/media-access-service'
import { getGridFSBucket } from '../../infrastructure/storage/mongo/gridfs-bucket'
import { getMongoDb } from '../../infrastructure/storage/mongo/mongo-client'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'

type MediaRecord = {
  ownerId: string
  contentType: string
  gridFsId: string
  status: 'ACTIVE' | 'INACTIVE'
}

const router = Router()

router.get('/:id/stream', async (req: Request, res: Response) => {
  try {
    const mediaIdParam = req.params.id
    if (typeof mediaIdParam !== 'string') {
      return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
    }

    const mediaId = mediaIdParam

    if (!ObjectId.isValid(mediaId)) {
      return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
    }

    const media = await getMongoDb()
      .collection<MediaRecord>('media')
      .findOne({ _id: new ObjectId(mediaId) })

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

    if (!ObjectId.isValid(media.gridFsId)) {
      return res.status(500).json({ code: 'INVALID_MEDIA_GRID_ID' })
    }

    const bucket = getGridFSBucket()
    const stream = bucket.openDownloadStream(new ObjectId(media.gridFsId))

    res.setHeader('Content-Type', media.contentType)

    stream.on('error', (error) => {
      console.error('Media stream error', error)
      if (!res.headersSent) {
        res.status(500).json({ code: 'MEDIA_STREAM_ERROR' })
        return
      }

      res.end()
    })

    stream.pipe(res)
    return
  } catch (error) {
    console.error('Stream media route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

export default router
