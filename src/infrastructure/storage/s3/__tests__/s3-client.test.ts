const mockSend = jest.fn()

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest
      .fn()
      .mockImplementation((input) => ({ _type: 'PutObject', ...input })),
    GetObjectCommand: jest
      .fn()
      .mockImplementation((input) => ({ _type: 'GetObject', ...input })),
    DeleteObjectCommand: jest
      .fn()
      .mockImplementation((input) => ({ _type: 'DeleteObject', ...input })),
    CreateMultipartUploadCommand: jest
      .fn()
      .mockImplementation((input) => ({
        _type: 'CreateMultipartUpload',
        ...input,
      })),
    UploadPartCommand: jest
      .fn()
      .mockImplementation((input) => ({ _type: 'UploadPart', ...input })),
    CompleteMultipartUploadCommand: jest
      .fn()
      .mockImplementation((input) => ({
        _type: 'CompleteMultipartUpload',
        ...input,
      })),
    AbortMultipartUploadCommand: jest
      .fn()
      .mockImplementation((input) => ({
        _type: 'AbortMultipartUpload',
        ...input,
      })),
    HeadObjectCommand: jest
      .fn()
      .mockImplementation((input) => ({ _type: 'HeadObject', ...input })),
  }
})

import { uploadToS3, getFromS3, deleteFromS3 } from '../s3-client'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

describe('uploadToS3', () => {
  beforeEach(() => {
    mockSend.mockReset()
    ;(S3Client as jest.Mock).mockClear()
    delete process.env.S3_ENDPOINT
    delete process.env.S3_ENDPOINTS
    process.env.S3_RETRY_DELAY_MS = '0'
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

  it('should retry transient DNS failures on the same endpoint', async () => {
    process.env.S3_ENDPOINT = 'http://minio-internal:9000'
    mockSend
      .mockRejectedValueOnce(
        Object.assign(new Error('getaddrinfo EAI_AGAIN minio-internal'), {
          code: 'EAI_AGAIN',
        })
      )
      .mockResolvedValueOnce({})

    await uploadToS3(
      {
        buffer: Buffer.from('retry'),
        originalname: 'retry.mp4',
        mimetype: 'video/mp4',
        size: 42,
      },
      'owner-1',
      'video'
    )

    expect(mockSend).toHaveBeenCalledTimes(2)
    expect(S3Client).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ endpoint: 'http://minio-internal:9000' })
    )
    expect(S3Client).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ endpoint: 'http://minio-internal:9000' })
    )
  })
})

describe('getFromS3', () => {
  beforeEach(() => {
    mockSend.mockReset()
    ;(S3Client as jest.Mock).mockClear()
    delete process.env.S3_ENDPOINT
    delete process.env.S3_ENDPOINTS
    process.env.S3_RETRY_DELAY_MS = '0'
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

  it('should fail over to the next configured endpoint on DNS errors', async () => {
    process.env.S3_ENDPOINTS =
      'http://minio-broken:9000, http://minio-healthy:9000'
    mockSend
      .mockRejectedValueOnce(
        Object.assign(new Error('getaddrinfo EAI_AGAIN minio-broken'), {
          code: 'EAI_AGAIN',
        })
      )
      .mockResolvedValueOnce({
        Body: { pipe: jest.fn() },
        ContentType: 'video/mp4',
      })

    const result = await getFromS3('video/owner-1/file.mp4')

    expect(result.contentType).toBe('video/mp4')
    expect(mockSend).toHaveBeenCalledTimes(2)
    expect(S3Client).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ endpoint: 'http://minio-broken:9000' })
    )
    expect(S3Client).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ endpoint: 'http://minio-healthy:9000' })
    )
  })
})

describe('deleteFromS3', () => {
  beforeEach(() => {
    mockSend.mockReset()
    ;(S3Client as jest.Mock).mockClear()
    delete process.env.S3_ENDPOINT
    delete process.env.S3_ENDPOINTS
    process.env.S3_RETRY_DELAY_MS = '0'
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

  it('should not retry non-transient S3 errors', async () => {
    process.env.S3_ENDPOINTS =
      'http://minio-broken:9000, http://minio-healthy:9000'
    mockSend.mockRejectedValueOnce(new Error('AccessDenied'))

    await expect(deleteFromS3('image/owner-1/file.jpg')).rejects.toThrow(
      'AccessDenied'
    )

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(S3Client).toHaveBeenCalledTimes(1)
  })
})
