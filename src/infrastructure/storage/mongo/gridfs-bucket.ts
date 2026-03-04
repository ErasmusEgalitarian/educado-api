import { GridFSBucket } from 'mongodb'
import { getMongoDb } from './mongo-client'

let bucket: GridFSBucket | null = null

export const getGridFSBucket = () => {
  if (!bucket) {
    bucket = new GridFSBucket(getMongoDb(), {
      bucketName: process.env.MONGO_GRIDFS_BUCKET || 'media',
    })
  }

  return bucket
}
