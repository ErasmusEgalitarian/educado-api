import { Db, MongoClient } from 'mongodb'

let mongoClient: MongoClient | null = null
let mongoDb: Db | null = null

const getRequiredEnv = (name: string) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const initMongo = async () => {
  if (mongoClient && mongoDb) {
    return
  }

  const mongoUrl = getRequiredEnv('MONGO_URL')
  const dbName = getRequiredEnv('MONGO_DB')

  mongoClient = new MongoClient(mongoUrl)
  await mongoClient.connect()
  mongoDb = mongoClient.db(dbName)
  console.log('[mongo] connected')
}

export const getMongoDb = () => {
  if (!mongoDb) {
    throw new Error('MongoDB connection is not initialized')
  }
  return mongoDb
}
