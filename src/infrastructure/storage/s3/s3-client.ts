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

type RetryableS3Error = NodeJS.ErrnoException & {
  $metadata?: {
    attempts?: number
    totalRetryDelay?: number
  }
}

type S3Command = unknown

const DEFAULT_S3_ENDPOINT = 'http://localhost:9000'
const DEFAULT_S3_REGION = 'us-east-1'
const DEFAULT_S3_MAX_ATTEMPTS = 3
const DEFAULT_S3_RETRY_DELAY_MS = 150
const RETRYABLE_S3_ERROR_CODES = new Set([
  'EAI_AGAIN',
  'ENOTFOUND',
  'ECONNRESET',
  'ETIMEDOUT',
])

const getS3Client = (endpoint: string) => {
  return new S3Client({
    endpoint,
    region: process.env.S3_REGION || DEFAULT_S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
    },
    forcePathStyle: true, // Required for MinIO
  })
}

const getBucket = () => process.env.S3_BUCKET || 'educado-media'

const getS3Endpoints = (): string[] => {
  const rawEndpoints =
    process.env.S3_ENDPOINTS || process.env.S3_ENDPOINT || DEFAULT_S3_ENDPOINT

  const endpoints = rawEndpoints
    .split(',')
    .map((endpoint) => endpoint.trim())
    .filter((endpoint) => endpoint.length > 0)

  return endpoints.length > 0 ? [...new Set(endpoints)] : [DEFAULT_S3_ENDPOINT]
}

const getS3MaxAttempts = (): number => {
  const parsedValue = Number.parseInt(
    process.env.S3_MAX_ATTEMPTS || `${DEFAULT_S3_MAX_ATTEMPTS}`,
    10
  )

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return DEFAULT_S3_MAX_ATTEMPTS
  }

  return parsedValue
}

const getS3RetryDelayMs = (): number => {
  const parsedValue = Number.parseInt(
    process.env.S3_RETRY_DELAY_MS || `${DEFAULT_S3_RETRY_DELAY_MS}`,
    10
  )

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return DEFAULT_S3_RETRY_DELAY_MS
  }

  return parsedValue
}

const wait = async (ms: number): Promise<void> => {
  if (ms <= 0) {
    return
  }

  await new Promise((resolve) => setTimeout(resolve, ms))
}

const isRetryableS3Error = (
  error: unknown
): error is RetryableS3Error & Error => {
  if (!(error instanceof Error)) {
    return false
  }

  const errorCode = (error as RetryableS3Error).code
  return (
    typeof errorCode === 'string' && RETRYABLE_S3_ERROR_CODES.has(errorCode)
  )
}

const buildRetriedS3Error = (
  error: unknown,
  endpoints: string[],
  attempts: number
): Error => {
  const endpointList = endpoints.join(', ')

  if (error instanceof Error) {
    error.message = `S3 request failed after ${attempts} attempt(s) across endpoint(s): ${endpointList}. ${error.message}`
    return error
  }

  return new Error(
    `S3 request failed after ${attempts} attempt(s) across endpoint(s): ${endpointList}.`
  )
}

const sendS3Command = async <T>(buildCommand: () => S3Command): Promise<T> => {
  const endpoints = getS3Endpoints()
  const maxAttempts = getS3MaxAttempts()
  const retryDelayMs = getS3RetryDelayMs()
  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    for (const endpoint of endpoints) {
      try {
        const client = getS3Client(endpoint)
        return (await client.send(buildCommand() as never)) as T
      } catch (error) {
        lastError = error

        if (!isRetryableS3Error(error)) {
          throw error
        }
      }
    }

    if (attempt < maxAttempts) {
      await wait(retryDelayMs * attempt)
    }
  }

  throw buildRetriedS3Error(lastError, endpoints, maxAttempts)
}

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
  const key = buildMediaKey(ownerId, kind, file.originalname)

  await sendS3Command(
    () =>
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
  key: string,
  range?: string
): Promise<{
  body: NodeJS.ReadableStream
  contentType: string
  contentLength?: number
}> => {
  const response = await sendS3Command<{
    Body?: NodeJS.ReadableStream
    ContentType?: string
    ContentLength?: number
  }>(
    () =>
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
        ...(range ? { Range: range } : {}),
      })
  )

  return {
    body: response.Body as NodeJS.ReadableStream,
    contentType: response.ContentType || 'application/octet-stream',
    contentLength: response.ContentLength,
  }
}

export const deleteFromS3 = async (key: string): Promise<void> => {
  await sendS3Command(
    () =>
      new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
  )
}

export const headS3Object = async (
  key: string
): Promise<{ size: number; contentType: string } | null> => {
  try {
    const response = await sendS3Command<{
      ContentLength?: number
      ContentType?: string
    }>(
      () =>
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
  const response = await sendS3Command<{
    UploadId?: string
  }>(
    () =>
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
  const response = await sendS3Command<{
    ETag?: string
  }>(
    () =>
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
  await sendS3Command(
    () =>
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
  await sendS3Command(
    () =>
      new AbortMultipartUploadCommand({
        Bucket: getBucket(),
        Key: key,
        UploadId: uploadId,
      })
  )
}
