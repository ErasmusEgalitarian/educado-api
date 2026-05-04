import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

const getS3Client = () => {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
    },
    forcePathStyle: true, // Required for MinIO
  })
}

const getBucket = () => process.env.S3_BUCKET || 'educado-media'

export const buildMediaKey = (
  ownerId: string,
  kind: string,
  filename: string
): string => `${kind}/${ownerId}/${randomUUID()}-${filename}`

export const uploadToS3 = async (
  file: {
    buffer: Buffer
    originalname: string
    mimetype: string
    size: number
  },
  ownerId: string,
  kind: string
): Promise<string> => {
  const client = getS3Client()
  const key = buildMediaKey(ownerId, kind, file.originalname)

  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  )

  return key
}

export const getFromS3 = async (
  key: string
): Promise<{ body: NodeJS.ReadableStream; contentType: string }> => {
  const client = getS3Client()

  const response = await client.send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  )

  return {
    body: response.Body as NodeJS.ReadableStream,
    contentType: response.ContentType || 'application/octet-stream',
  }
}

export const deleteFromS3 = async (key: string): Promise<void> => {
  const client = getS3Client()

  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  )
}

export const headS3Object = async (
  key: string
): Promise<{ size: number; contentType: string } | null> => {
  const client = getS3Client()
  try {
    const response = await client.send(
      new HeadObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
    )
    return {
      size: response.ContentLength ?? 0,
      contentType: response.ContentType || 'application/octet-stream',
    }
  } catch {
    return null
  }
}

// --- Multipart upload (used by chunked client uploads) ---

export const initMultipartUpload = async (
  key: string,
  contentType: string
): Promise<string> => {
  const client = getS3Client()
  const response = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: getBucket(),
      Key: key,
      ContentType: contentType,
    })
  )
  if (!response.UploadId) {
    throw new Error('S3 did not return an UploadId')
  }
  return response.UploadId
}

export const uploadPartToS3 = async (
  key: string,
  uploadId: string,
  partNumber: number,
  body: Buffer
): Promise<string> => {
  const client = getS3Client()
  const response = await client.send(
    new UploadPartCommand({
      Bucket: getBucket(),
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: body,
    })
  )
  if (!response.ETag) {
    throw new Error('S3 did not return an ETag for the uploaded part')
  }
  return response.ETag
}

export const completeMultipartUpload = async (
  key: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[]
): Promise<void> => {
  const client = getS3Client()
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: getBucket(),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .slice()
          .sort((a, b) => a.partNumber - b.partNumber)
          .map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
      },
    })
  )
}

export const abortMultipartUpload = async (
  key: string,
  uploadId: string
): Promise<void> => {
  const client = getS3Client()
  await client.send(
    new AbortMultipartUploadCommand({
      Bucket: getBucket(),
      Key: key,
      UploadId: uploadId,
    })
  )
}
