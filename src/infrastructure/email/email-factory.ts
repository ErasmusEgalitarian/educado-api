import { EmailService } from '../../application/email/email-service'

export const createEmailService = () => {
  return new EmailService()
}
