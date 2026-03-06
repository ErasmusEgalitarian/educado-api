import { Queue } from 'bullmq'
import { SendEmailInput } from '../../application/email/email-types'
import { redisConnection } from './redis'

export const EMAIL_QUEUE_NAME = 'email-queue'
export const EMAIL_JOB_NAME = 'send-email'

export const emailQueue = new Queue<
  SendEmailInput,
  void,
  typeof EMAIL_JOB_NAME
>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
})
