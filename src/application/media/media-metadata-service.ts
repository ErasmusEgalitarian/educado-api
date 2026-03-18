import { AppError } from '../common/app-error'
import { MediaAsset } from '../../models'

type SaveMediaMetadataInput = {
  id: string
  title: string
  altText: string
  description: string
}

export const updateMediaMetadata = async (input: SaveMediaMetadataInput) => {
  const existing = await MediaAsset.findByPk(input.id)

  if (!existing) {
    throw new AppError(404, { code: 'MEDIA_METADATA_NOT_FOUND' })
  }

  await existing.update({
    title: input.title,
    altText: input.altText,
    description: input.description,
  })

  return existing
}

export const getMediaMetadata = async (id: string) => {
  const metadata = await MediaAsset.findByPk(id)

  if (!metadata) {
    throw new AppError(404, { code: 'MEDIA_METADATA_NOT_FOUND' })
  }

  return metadata
}
