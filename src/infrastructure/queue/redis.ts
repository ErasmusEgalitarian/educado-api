import { ConnectionOptions } from 'bullmq'

const redisHost = process.env.REDIS_HOST ?? '127.0.0.1'
const redisPassword = process.env.REDIS_PASSWORD ?? undefined

const parsedPort = Number.parseInt(process.env.REDIS_PORT ?? '6379', 10)
const redisPort = Number.isNaN(parsedPort) ? 6379 : parsedPort

export const redisConnection: ConnectionOptions = {
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null,
}
