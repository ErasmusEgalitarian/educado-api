const mockSend = jest.fn()

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest.fn().mockImplementation((input) => ({ _type: 'PutObject', ...input })),
    GetObjectCommand: jest.fn().mockImplementation((input) => ({ _type: 'GetObject', ...input })),
    DeleteObjectCommand: jest.fn().mockImplementation((input) => ({ _type: 'DeleteObject', ...input })),
  }
})

import { uploadToS3, getFromS3, deleteFromS3 } from '../s3-client'
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

describe('uploadToS3', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  it('should call PutObjectCommand with correct params and return the key', async () => {
    mockSend.mockResolvedValue({})

    const file = {
      buffer: Buffer.from('file data'),
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    }

    const key = await uploadToS3(file, 'owner-1', 'image')

    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Body: file.buffer,
        ContentType: 'image/jpeg',
      })
    )
    expect(key).toContain('image/owner-1/')
    expect(key).toContain('photo.jpg')
    expect(mockSend).toHaveBeenCalledTimes(1)
  })

  it('should include ownerId and kind in the S3 key', async () => {
    mockSend.mockResolvedValue({})

    const file = {
      buffer: Buffer.from('data'),
      originalname: 'clip.mp4',
      mimetype: 'video/mp4',
      size: 2048,
    }

    const key = await uploadToS3(file, 'user-42', 'video')
    expect(key).toMatch(/^video\/user-42\//)
  })
})

describe('getFromS3', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  it('should call GetObjectCommand and return body and contentType', async () => {
    const mockBody = { pipe: jest.fn() }
    mockSend.mockResolvedValue({
      Body: mockBody,
      ContentType: 'image/png',
    })

    const result = await getFromS3('image/owner-1/file.png')

    expect(GetObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: 'image/owner-1/file.png',
      })
    )
    expect(result.body).toBe(mockBody)
    expect(result.contentType).toBe('image/png')
  })

  it('should default contentType to application/octet-stream', async () => {
    mockSend.mockResolvedValue({
      Body: {},
      ContentType: undefined,
    })

    const result = await getFromS3('some/key')
    expect(result.contentType).toBe('application/octet-stream')
  })
})

describe('deleteFromS3', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  it('should call DeleteObjectCommand with correct key', async () => {
    mockSend.mockResolvedValue({})

    await deleteFromS3('image/owner-1/file.jpg')

    expect(DeleteObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: 'image/owner-1/file.jpg',
      })
    )
    expect(mockSend).toHaveBeenCalledTimes(1)
  })
})
