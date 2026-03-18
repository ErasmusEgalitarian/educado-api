import { Request, Response, Router } from 'express'
import { canAccessMedia } from '../../application/media/media-access-service'
import { validateMediaMetadata } from '../../application/media/media-validation'
import { deleteFromS3 } from '../../infrastructure/storage/s3/s3-client'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { MediaAsset } from '../../models'

const router = Router()

const saveMetadata = async (
  req: Request,
  res: Response,
  kind: 'image' | 'video'
) => {
  const mediaId = typeof req.params.id === 'string' ? req.params.id : ''
  if (!mediaId) {
    return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
  }

  const validation = validateMediaMetadata(req.body as Record<string, unknown>)
  if (!validation.data) {
    return res.status(422).json({
      code: 'VALIDATION_ERROR',
      fieldErrors: validation.fieldErrors,
    })
  }

  const media = await MediaAsset.findByPk(mediaId)
  if (!media || media.kind !== kind) {
    return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
  }

  const user = getAuthContext(res)
  if (!canAccessMedia(user, { ownerId: media.ownerId })) {
    return res.status(403).json({ code: 'FORBIDDEN' })
  }

  await media.update({
    title: validation.data.title,
    altText: validation.data.altText,
    description: validation.data.description,
  })

  return res.status(200).json({
    _id: media.id,
    id: media.id,
    ownerId: media.ownerId,
    kind: media.kind,
    title: media.title,
    altText: media.altText,
    description: media.description,
    streamUrl: `/media/${media.id}/stream`,
    status: media.status,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
  })
}

const deleteMedia = async (
  req: Request,
  res: Response,
  kind: 'image' | 'video'
) => {
  const mediaId = typeof req.params.id === 'string' ? req.params.id : ''
  if (!mediaId) {
    return res.status(400).json({ code: 'INVALID_MEDIA_ID' })
  }

  const media = await MediaAsset.findByPk(mediaId)
  if (!media || media.kind !== kind) {
    return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })
  }

  const user = getAuthContext(res)
  if (!canAccessMedia(user, { ownerId: media.ownerId })) {
    return res.status(403).json({ code: 'FORBIDDEN' })
  }

  await deleteFromS3(media.s3Key)
  await media.destroy()

  return res.status(204).send()
}

router.post('/images/:id/metadata', async (req: Request, res: Response) => {
  try {
    return await saveMetadata(req, res, 'image')
  } catch (error) {
    console.error('Create image metadata route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.post('/videos/:id/metadata', async (req: Request, res: Response) => {
  try {
    return await saveMetadata(req, res, 'video')
  } catch (error) {
    console.error('Create video metadata route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.put('/images/:id/metadata', async (req: Request, res: Response) => {
  try {
    return await saveMetadata(req, res, 'image')
  } catch (error) {
    console.error('Update image metadata route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

router.put('/videos/:id/metadata', async (req: Request, res: Response) => {
  try {
    return await saveMetadata(req, res, 'video')
  } catch (error) {
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
