import { ConnectionOptions } from 'bullmq'

const redisHost = process.env.REDIS_HOST ?? '127.0.0.1'

const parsedPort = Number.parseInt(process.env.REDIS_PORT ?? '6379', 10)
const redisPort = Number.isNaN(parsedPort) ? 6379 : parsedPort

export const redisConnection: ConnectionOptions = {
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
}
