import { Worker } from 'bullmq'
import { SendEmailInput } from '../../application/email/email-types'
import { ResendEmailProvider } from '../email/resend-email-provider'
import { EMAIL_JOB_NAME, EMAIL_QUEUE_NAME } from './email-queue'
import { redisConnection } from './redis'

export const startEmailWorker = () => {
  const provider = new ResendEmailProvider()

  const worker = new Worker<SendEmailInput, void, typeof EMAIL_JOB_NAME>(
    EMAIL_QUEUE_NAME,
    async (job) => {
      const { to, subject, html } = job.data
      await provider.send({ to, subject, html })
    },
    {
      connection: redisConnection,
    }
  )

  worker.on('failed', (job, error) => {
    console.error(`Email job failed (${job?.id ?? 'unknown'}):`, error)
  })

  const shutdown = async () => {
    await worker.close()
    process.exit(0)
  }

  process.on('SIGINT', () => {
    void shutdown()
  })

  process.on('SIGTERM', () => {
    void shutdown()
  })
}
