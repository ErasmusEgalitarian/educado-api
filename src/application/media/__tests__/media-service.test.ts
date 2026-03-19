jest.mock('../../../models', () => ({
  MediaAsset: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}))

jest.mock('../../../infrastructure/storage/s3/s3-client', () => ({
  uploadToS3: jest.fn(),
}))

import { MediaAsset } from '../../../models'
import { uploadToS3 } from '../../../infrastructure/storage/s3/s3-client'
import {
  uploadMedia,
  listMediaByOwner,
  listMediaForAdmin,
} from '../media-service'

const mockMediaAsset = (overrides: Record<string, unknown> = {}) => ({
  id: 'media-1',
  ownerId: 'owner-1',
  kind: 'image',
  s3Key: 'image/owner-1/file.jpg',
  filename: 'photo.jpg',
  contentType: 'image/jpeg',
  size: 1024,
  status: 'ACTIVE',
  title: '',
  altText: '',
  description: '',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
})

describe('uploadMedia', () => {
  it('should call uploadToS3 and create a MediaAsset record', async () => {
    ;(uploadToS3 as jest.Mock).mockResolvedValue('image/owner-1/uuid-photo.jpg')
    ;(MediaAsset.create as jest.Mock).mockResolvedValue(mockMediaAsset())

    const file = {
      buffer: Buffer.from('data'),
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File

    const result = await uploadMedia({
      ownerId: 'owner-1',
      kind: 'image',
      file,
    })

    expect(uploadToS3).toHaveBeenCalledWith(file, 'owner-1', 'image')
    expect(MediaAsset.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 'owner-1',
        kind: 'image',
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
        size: 1024,
        status: 'ACTIVE',
      })
    )
    expect(result._id).toBe('media-1')
    expect(result.id).toBe('media-1')
    expect(result.gridFsId).toBe('media-1')
  })

  it('should return normalized response with _id, id, gridFsId fields', async () => {
    ;(uploadToS3 as jest.Mock).mockResolvedValue('video/owner-1/uuid-vid.mp4')
    ;(MediaAsset.create as jest.Mock).mockResolvedValue(
      mockMediaAsset({ id: 'media-2', kind: 'video' })
    )

    const file = {
      buffer: Buffer.from('data'),
      originalname: 'vid.mp4',
      mimetype: 'video/mp4',
      size: 2048,
    } as Express.Multer.File

    const result = await uploadMedia({
      ownerId: 'owner-1',
      kind: 'video',
      file,
    })
    expect(result._id).toBe('media-2')
    expect(result.id).toBe('media-2')
    expect(result.gridFsId).toBe('media-2')
  })
})

describe('listMediaByOwner', () => {
  it('should query with ownerId and return paginated results', async () => {
    const assets = [mockMediaAsset(), mockMediaAsset({ id: 'media-2' })]
    ;(MediaAsset.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: assets,
      count: 2,
    })

    const result = await listMediaByOwner('owner-1', { page: 1, limit: 10 })

    expect(MediaAsset.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ownerId: 'owner-1' }),
        limit: 10,
        offset: 0,
      })
    )
    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(2)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  it('should apply kind filter', async () => {
    ;(MediaAsset.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    })

    await listMediaByOwner('owner-1', { page: 1, limit: 10, kind: 'video' })

    expect(MediaAsset.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ownerId: 'owner-1', kind: 'video' }),
      })
    )
  })

  it('should apply status filter', async () => {
    ;(MediaAsset.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    })

    await listMediaByOwner('owner-1', {
      page: 1,
      limit: 10,
      status: 'INACTIVE',
    })

    expect(MediaAsset.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ownerId: 'owner-1',
          status: 'INACTIVE',
        }),
      })
    )
  })

  it('should calculate correct offset for page 2', async () => {
    ;(MediaAsset.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    })

    await listMediaByOwner('owner-1', { page: 2, limit: 5 })

    expect(MediaAsset.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 5 })
    )
  })

  it('should return normalized items with streamUrl', async () => {
    ;(MediaAsset.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [mockMediaAsset()],
      count: 1,
    })

    const result = await listMediaByOwner('owner-1', { page: 1, limit: 10 })
    const item = result.items[0]
    expect(item._id).toBe('media-1')
    expect(item.id).toBe('media-1')
    expect(item.gridFsId).toBe('media-1')
    expect(item.streamUrl).toBe('/media/media-1/stream')
  })
})

describe('listMediaForAdmin', () => {
  it('should query without ownerId filter', async () => {
    ;(MediaAsset.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    })

    await listMediaForAdmin({ page: 1, limit: 20 })

    expect(MediaAsset.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({ ownerId: expect.anything() }),
      })
    )
  })

  it('should apply kind and status filters', async () => {
    ;(MediaAsset.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [],
      count: 0,
    })

    await listMediaForAdmin({
      page: 1,
      limit: 10,
      kind: 'image',
      status: 'ACTIVE',
    })

    expect(MediaAsset.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ kind: 'image', status: 'ACTIVE' }),
      })
    )
  })

  it('should return paginated results', async () => {
    ;(MediaAsset.findAndCountAll as jest.Mock).mockResolvedValue({
      rows: [mockMediaAsset()],
      count: 50,
    })

    const result = await listMediaForAdmin({ page: 3, limit: 10 })
    expect(result.page).toBe(3)
    expect(result.limit).toBe(10)
    expect(result.total).toBe(50)
  })
})
