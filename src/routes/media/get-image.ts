import { Request, Response, Router } from 'express'
import { canAccessMedia } from '../../application/media/media-access-service'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { MediaAsset } from '../../models'

const router = Router()

router.get('/images/:id', async (req: Request, res: Response) => {
  try {
    const mediaId = typeof req.params.id === 'string' ? req.params.id : ''
    if (!mediaId) return res.status(400).json({ code: 'INVALID_MEDIA_ID' })

    const media = await MediaAsset.findByPk(mediaId)
    if (!media || media.kind !== 'image') return res.status(404).json({ code: 'MEDIA_NOT_FOUND' })

    const user = getAuthContext(res)
    if (!canAccessMedia(user, { ownerId: media.ownerId })) return res.status(403).json({ code: 'FORBIDDEN' })
    if (media.status === 'INACTIVE') return res.status(403).json({ code: 'MEDIA_INACTIVE' })

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
  } catch (error) {
    console.error('Get image metadata route error', error)
    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
  }
})

export default router
