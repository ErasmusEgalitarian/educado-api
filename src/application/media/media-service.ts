import { Op } from 'sequelize'
import { MediaAsset } from '../../models'
import {
  abortMultipartUpload,
  buildMediaKey,
  completeMultipartUpload,
  deleteFromS3,
  headS3Object,
  initMultipartUpload,
  uploadPartToS3,
  uploadToS3,
} from '../../infrastructure/storage/s3/s3-client'

type CreateMediaInput = {
  ownerId: string
  kind: 'image' | 'video'
  file: Express.Multer.File
}

type InitMultipartInput = {
  ownerId: string
  kind: 'image' | 'video'
  filename: string
  contentType: string
  size: number
}

type ListMediaFilters = {
  kind?: 'image' | 'video'
  status?: 'ACTIVE' | 'INACTIVE'
}

type ListMediaOptions = ListMediaFilters & {
  page: number
  limit: number
}

const VIDEO_MAX_SIZE = 500 * 1024 * 1024
const IMAGE_MAX_SIZE = 10 * 1024 * 1024

// Each chunk uploaded by the client is a single HTTP request through the
// reverse proxy / Cloudflare tunnel. Cloudflare's Free plan caps request
// bodies at 100 MB; we leave generous headroom for boundary overhead and
// any other proxy in the path.
export const UPLOAD_CHUNK_SIZE = 50 * 1024 * 1024

export const uploadMedia = async ({
  ownerId,
  kind,
  file,
}: CreateMediaInput) => {
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

  return serializeUploadResponse(media)
}

export const initChunkedUpload = async ({
  ownerId,
  kind,
  filename,
  contentType,
  size,
}: InitMultipartInput) => {
  const maxSize = kind === 'video' ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE
  if (size <= 0 || size > maxSize) {
    return { error: 'INVALID_SIZE' as const }
  }

  const s3Key = buildMediaKey(ownerId, kind, filename)
  const uploadId = await initMultipartUpload(s3Key, contentType)

  const media = await MediaAsset.create({
    ownerId,
    kind,
    s3Key,
    filename,
    contentType,
    size,
    status: 'PENDING',
    uploadId,
    title: '',
    altText: '',
    description: '',
  })

  return {
    id: media.id,
    chunkSize: UPLOAD_CHUNK_SIZE,
    totalParts: Math.ceil(size / UPLOAD_CHUNK_SIZE),
  }
}

export const uploadMediaPart = async ({
  id,
  ownerId,
  kind,
  partNumber,
  body,
}: {
  id: string
  ownerId: string
  kind: 'image' | 'video'
  partNumber: number
  body: Buffer
}) => {
  if (!Number.isInteger(partNumber) || partNumber < 1) {
    return { error: 'INVALID_PART_NUMBER' as const }
  }

  const media = await MediaAsset.findByPk(id)
  if (!media || media.ownerId !== ownerId || media.kind !== kind) {
    return { error: 'NOT_FOUND' as const }
  }
  if (media.status !== 'PENDING' || !media.uploadId) {
    return { error: 'NOT_PENDING' as const }
  }

  const etag = await uploadPartToS3(
    media.s3Key,
    media.uploadId,
    partNumber,
    body
  )
  return { etag, partNumber }
}

export const completeChunkedUpload = async ({
  id,
  ownerId,
  kind,
  parts,
}: {
  id: string
  ownerId: string
  kind: 'image' | 'video'
  parts: { partNumber: number; etag: string }[]
}) => {
  const media = await MediaAsset.findByPk(id)
  if (!media || media.ownerId !== ownerId || media.kind !== kind) {
    return { error: 'NOT_FOUND' as const }
  }
  if (media.status !== 'PENDING' || !media.uploadId) {
    return {
      error: 'NOT_PENDING' as const,
      media: serializeUploadResponse(media),
    }
  }
  if (parts.length === 0) {
    return { error: 'NO_PARTS' as const }
  }

  await completeMultipartUpload(media.s3Key, media.uploadId, parts)

  const head = await headS3Object(media.s3Key)
  if (!head) {
    return { error: 'OBJECT_MISSING' as const }
  }

  const maxSize = kind === 'video' ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE
  if (head.size > maxSize) {
    await deleteFromS3(media.s3Key).catch(() => undefined)
    await media.destroy()
    return { error: 'INVALID_SIZE' as const }
  }

  media.size = head.size
  media.status = 'ACTIVE'
  media.uploadId = null
  await media.save()

  return { media: serializeUploadResponse(media) }
}

export const abortChunkedUpload = async ({
  id,
  ownerId,
  kind,
}: {
  id: string
  ownerId: string
  kind: 'image' | 'video'
}) => {
  const media = await MediaAsset.findByPk(id)
  if (!media || media.ownerId !== ownerId || media.kind !== kind) {
    return { error: 'NOT_FOUND' as const }
  }
  if (media.uploadId) {
    await abortMultipartUpload(media.s3Key, media.uploadId).catch(
      () => undefined
    )
  }
  await media.destroy()
  return { ok: true as const }
}

export const listMediaByOwner = async (
  ownerId: string,
  options: ListMediaOptions
) => {
  const base: Record<string, unknown> = { ownerId }
  if (options.kind) base.kind = options.kind

  const { rows: items, count: total } = await MediaAsset.findAndCountAll({
    where: buildListWhere(base, options.status),
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

  const { rows: items, count: total } = await MediaAsset.findAndCountAll({
    where: buildListWhere(where, options.status),
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

function buildListWhere(
  base: Record<string, unknown>,
  status?: 'ACTIVE' | 'INACTIVE'
) {
  if (status) {
    return { ...base, status }
  }
  return { ...base, status: { [Op.in]: ['ACTIVE', 'INACTIVE'] } }
}

function serializeUploadResponse(media: MediaAsset) {
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
