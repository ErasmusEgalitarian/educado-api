import {
  emailQueue,
  EMAIL_JOB_NAME,
} from '../../infrastructure/queue/email-queue'
import { SendEmailInput } from './email-types'

export class EmailService {
  async sendEmail(data: SendEmailInput) {
    await emailQueue.add(EMAIL_JOB_NAME, data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    })
  }
}
