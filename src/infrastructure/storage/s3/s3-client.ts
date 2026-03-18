import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
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

export const uploadToS3 = async (file: { buffer: Buffer; originalname: string; mimetype: string; size: number }, ownerId: string, kind: string): Promise<string> => {
  const client = getS3Client()
  const key = `${kind}/${ownerId}/${randomUUID()}-${file.originalname}`

  await client.send(new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }))

  return key
}

export const getFromS3 = async (key: string): Promise<{ body: NodeJS.ReadableStream; contentType: string }> => {
  const client = getS3Client()

  const response = await client.send(new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  }))

  return {
    body: response.Body as NodeJS.ReadableStream,
    contentType: response.ContentType || 'application/octet-stream',
  }
}

export const deleteFromS3 = async (key: string): Promise<void> => {
  const client = getS3Client()

  await client.send(new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  }))
}
