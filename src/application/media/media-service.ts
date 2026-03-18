import { MediaAsset } from '../../models'
import { uploadToS3 } from '../../infrastructure/storage/s3/s3-client'

type CreateMediaInput = {
  ownerId: string
  kind: 'image' | 'video'
  file: Express.Multer.File
}

type ListMediaFilters = {
  kind?: 'image' | 'video'
  status?: 'ACTIVE' | 'INACTIVE'
}

type ListMediaOptions = ListMediaFilters & {
  page: number
  limit: number
}

export const uploadMedia = async ({ ownerId, kind, file }: CreateMediaInput) => {
  const s3Key = await uploadToS3(file, ownerId, kind)

  const media = await MediaAsset.create({
    ownerId,
    kind,
    s3Key,
    filename: file.originalname,
    contentType: file.mimetype,
    size: file.size,
    status: 'ACTIVE',
    title: '',
    altText: '',
    description: '',
  })

  return {
    _id: media.id,
    id: media.id,
    ownerId: media.ownerId,
    kind: media.kind,
    filename: media.filename,
    contentType: media.contentType,
    size: media.size,
    gridFsId: media.id, // backward compat -- frontend uses _id ?? gridFsId
    status: media.status,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
  }
}

export const listMediaByOwner = async (ownerId: string, options: ListMediaOptions) => {
  const where: Record<string, unknown> = { ownerId }
  if (options.kind) where.kind = options.kind
  if (options.status) where.status = options.status

  const { rows: items, count: total } = await MediaAsset.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset: (options.page - 1) * options.limit,
    limit: options.limit,
  })

  return {
    items: items.map(normalizeMediaAsset),
    page: options.page,
    limit: options.limit,
    total,
  }
}

export const listMediaForAdmin = async (options: ListMediaOptions) => {
  const where: Record<string, unknown> = {}
  if (options.kind) where.kind = options.kind
  if (options.status) where.status = options.status

  const { rows: items, count: total } = await MediaAsset.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset: (options.page - 1) * options.limit,
    limit: options.limit,
  })

  return {
    items: items.map(normalizeMediaAsset),
    page: options.page,
    limit: options.limit,
    total,
  }
}

function normalizeMediaAsset(asset: MediaAsset) {
  return {
    _id: asset.id,
    id: asset.id,
    ownerId: asset.ownerId,
    kind: asset.kind,
    filename: asset.filename,
    contentType: asset.contentType,
    size: asset.size,
    gridFsId: asset.id,
    status: asset.status,
    title: asset.title,
    altText: asset.altText,
    description: asset.description,
    streamUrl: `/media/${asset.id}/stream`,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  }
}
