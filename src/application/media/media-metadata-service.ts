import { AppError } from '../common/app-error'
import { MediaAsset } from '../../models'

type SaveMediaMetadataInput = {
  ownerId: string
  kind: 'image' | 'video'
  mediaId: string
  title: string
  altText: string
  description: string
}

const buildStreamUrl = (mediaId: string) => `/media/${mediaId}/stream`

export const createOrUpdateMediaMetadata = async (
  input: SaveMediaMetadataInput
) => {
  const streamUrl = buildStreamUrl(input.mediaId)

  const existing = await MediaAsset.findOne({ where: { mediaId: input.mediaId } })

  if (existing) {
    await existing.update({
      title: input.title,
      altText: input.altText,
      description: input.description,
      streamUrl,
      ownerId: input.ownerId,
      kind: input.kind,
    })

    return existing
  }

  return MediaAsset.create({
    ownerId: input.ownerId,
    kind: input.kind,
    mediaId: input.mediaId,
    streamUrl,
    title: input.title,
    altText: input.altText,
    description: input.description,
  })
}

export const updateMediaMetadata = async (input: SaveMediaMetadataInput) => {
  const existing = await MediaAsset.findOne({ where: { mediaId: input.mediaId } })

  if (!existing) {
    throw new AppError(404, { code: 'MEDIA_METADATA_NOT_FOUND' })
  }

  await existing.update({
    title: input.title,
    altText: input.altText,
    description: input.description,
    ownerId: input.ownerId,
    kind: input.kind,
    streamUrl: buildStreamUrl(input.mediaId),
  })

  return existing
}

export const getMediaMetadata = async (mediaId: string) => {
  const metadata = await MediaAsset.findOne({ where: { mediaId } })

  if (!metadata) {
    throw new AppError(404, { code: 'MEDIA_METADATA_NOT_FOUND' })
  }

  return metadata
}

export const deleteMediaMetadata = async (mediaId: string) => {
  await MediaAsset.destroy({ where: { mediaId } })
}
