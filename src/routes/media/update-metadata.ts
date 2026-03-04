import { Request, Response, Router } from 'express'
import { ObjectId } from 'mongodb'
import { AppError } from '../../application/common/app-error'
import { canAccessMedia } from '../../application/media/media-access-service'
import {
  createOrUpdateMediaMetadata,
  deleteMediaMetadata,
  updateMediaMetadata,
} from '../../application/media/media-metadata-service'
import { validateMediaMetadata } from '../../application/media/media-validation'
import { getGridFSBucket } from '../../infrastructure/storage/mongo/gridfs-bucket'
import { getMongoDb } from '../../infrastructure/storage/mongo/mongo-client'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'

type MediaRecord = {
  ownerId: string
  kind: 'image' | 'video'
  title?: string
  altText?: string
  description?: string
  filename: string
  contentType: string
  size: number
  gridFsId: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: Date
  updatedAt: Date
}

const router = Router()

const getMediaByIdAndKind = async (
  mediaId: string,
  kind: 'image' | 'video'
) => {
  const collection = getMongoDb().collection<MediaRecord>('media')
  const media = await collection.findOne({
    _id: new ObjectId(mediaId),
    kind,
  })

  return { collection, media }
}

const saveMetadata = async (
  req: Request,
  res: Response,
  kind: 'image' | 'video',
  mode: 'create' | 'update'
) => {
  const mediaId = typeof req.params.id === 'string' ? req.params.id : ''

  if (!ObjectId.isValid(mediaId)) {
    return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
  }

  const validation = validateMediaMetadata(req.body as Record<string, unknown>)
  if (!validation.data) {
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      fieldErrors: validation.fieldErrors,
    })
  }

  const { media } = await getMediaByIdAndKind(mediaId, kind)

  if (!media) {
    return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
  }

  const user = getAuthContext(res)
  if (!canAccessMedia(user, media)) {
    return res.status(403).json({ code: 'FORBIDDEN' })
  }

  const metadata =
    mode === 'update'
      ? await updateMediaMetadata({
          ownerId: media.ownerId,
          kind,
          mediaId,
          title: validation.data.title,
          altText: validation.data.altText,
          description: validation.data.description,
        })
      : await createOrUpdateMediaMetadata({
          ownerId: media.ownerId,
          kind,
          mediaId,
          title: validation.data.title,
          altText: validation.data.altText,
          description: validation.data.description,
        })

  return res.status(200).json({
    _id: mediaId,
    ownerId: media.ownerId,
    kind,
    title: metadata.title,
    altText: metadata.altText,
    description: metadata.description,
    streamUrl: metadata.streamUrl,
    status: media.status,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  })
}

const deleteMedia = async (
  req: Request,
  res: Response,
  kind: 'image' | 'video'
) => {
  const mediaId = typeof req.params.id === 'string' ? req.params.id : ''

  if (!ObjectId.isValid(mediaId)) {
    return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
  }

  const { collection, media } = await getMediaByIdAndKind(mediaId, kind)

  if (!media) {
    return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
  }

  const user = getAuthContext(res)
  if (!canAccessMedia(user, media)) {
    return res.status(403).json({ code: 'FORBIDDEN' })
  }

  if (!ObjectId.isValid(media.gridFsId)) {
    return res.status(500).json({ code: 'INVALID_MEDIA_GRID_ID' })
  }

  const bucket = getGridFSBucket()
  await bucket.delete(new ObjectId(media.gridFsId))

  await deleteMediaMetadata(mediaId)

  await collection.deleteOne({
    _id: new ObjectId(mediaId),
    kind,
  })

  return res.status(204).send()
}

router.post('/images/:id/metadata', async (req: Request, res: Response) => {
  try {
    return await saveMetadata(req, res, 'image', 'create')
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    console.error('Create image metadata route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.post('/videos/:id/metadata', async (req: Request, res: Response) => {
  try {
    return await saveMetadata(req, res, 'video', 'create')
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    console.error('Create video metadata route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.put('/images/:id/metadata', async (req: Request, res: Response) => {
  try {
    return await saveMetadata(req, res, 'image', 'update')
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    console.error('Update image metadata route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.put('/videos/:id/metadata', async (req: Request, res: Response) => {
  try {
    return await saveMetadata(req, res, 'video', 'update')
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.payload)
    }

    console.error('Update video metadata route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.delete('/images/:id', async (req: Request, res: Response) => {
  try {
    return await deleteMedia(req, res, 'image')
  } catch (error) {
    console.error('Delete image route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.delete('/videos/:id', async (req: Request, res: Response) => {
  try {
    return await deleteMedia(req, res, 'video')
  } catch (error) {
    console.error('Delete video route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

export default router
