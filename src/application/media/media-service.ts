import { ObjectId } from 'mongodb'
import { getGridFSBucket } from '../../infrastructure/storage/mongo/gridfs-bucket'
import { getMongoDb } from '../../infrastructure/storage/mongo/mongo-client'
import { MediaDocument, MediaKind } from '../../types/media/media'

type CreateMediaInput = {
  ownerId: string
  kind: MediaKind
  file: Express.Multer.File
}

type ListMediaFilters = {
  kind?: MediaKind
  status?: 'ACTIVE' | 'INACTIVE'
}

type ListMediaOptions = ListMediaFilters & {
  page: number
  limit: number
}

type StoredMediaDocument = Omit<MediaDocument, '_id'> & {
  _id: ObjectId
}

type ListMediaResponse = {
  items: MediaDocument[]
  page: number
  limit: number
  total: number
}

const normalizeMedia = (doc: StoredMediaDocument): MediaDocument => {
  return {
    _id: doc._id.toHexString(),
    ownerId: doc.ownerId,
    kind: doc.kind,
    filename: doc.filename,
    contentType: doc.contentType,
    size: doc.size,
    gridFsId: doc.gridFsId,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

const buildFilters = (filters?: ListMediaFilters) => {
  return {
    ...(filters?.kind ? { kind: filters.kind } : {}),
    ...(filters?.status ? { status: filters.status } : {}),
  }
}

export const uploadMedia = async ({
  ownerId,
  kind,
  file,
}: CreateMediaInput): Promise<MediaDocument> => {
  const bucket = getGridFSBucket()
  const gridId = new ObjectId()

  await new Promise<void>((resolve, reject) => {
    const uploadStream = bucket.openUploadStreamWithId(gridId, file.originalname, {
      metadata: { ownerId, kind },
    })

    uploadStream.on('error', reject)
    uploadStream.on('finish', () => resolve())
    uploadStream.end(file.buffer)
  })

  const doc: Omit<MediaDocument, '_id'> = {
    ownerId,
    kind,
    filename: file.originalname,
    contentType: file.mimetype,
    size: file.size,
    gridFsId: gridId.toHexString(),
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await getMongoDb().collection<Omit<MediaDocument, '_id'>>('media').insertOne(doc)

  return {
    _id: result.insertedId.toHexString(),
    ...doc,
  }
}

export const listMediaByOwner = async (
  ownerId: string,
  options: ListMediaOptions
): Promise<ListMediaResponse> => {
  const collection = getMongoDb().collection<StoredMediaDocument>('media')
  const filters = {
    ownerId,
    ...buildFilters(options),
  }

  const [items, total] = await Promise.all([
    collection
      .find(filters)
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .toArray(),
    collection.countDocuments(filters),
  ])

  return {
    items: items.map(normalizeMedia),
    page: options.page,
    limit: options.limit,
    total,
  }
}

export const listMediaForAdmin = async (
  options: ListMediaOptions
): Promise<ListMediaResponse> => {
  const collection = getMongoDb().collection<StoredMediaDocument>('media')
  const filters = buildFilters(options)

  const [items, total] = await Promise.all([
    collection
      .find(filters)
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .toArray(),
    collection.countDocuments(filters),
  ])

  return {
    items: items.map(normalizeMedia),
    page: options.page,
    limit: options.limit,
    total,
  }
}
