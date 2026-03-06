import { Resend } from 'resend'
import {
  EmailProvider,
  SendEmailInput,
} from '../../application/email/email-types'

const getEmailApiKey = () => {
  const apiKey = process.env.EMAIL_API_KEY

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('EMAIL_API_KEY is not configured')
  }

  return apiKey
}

const getEmailFrom = () => {
  const emailFrom = process.env.EMAIL_FROM

  if (!emailFrom || emailFrom.trim() === '') {
    throw new Error('EMAIL_FROM is not configured')
  }

  return emailFrom
}

export class ResendEmailProvider implements EmailProvider {
  async send({ to, subject, html }: SendEmailInput): Promise<void> {
    const resend = new Resend(getEmailApiKey())
    const response = await resend.emails.send({
      from: getEmailFrom(),
      to: [to],
      subject,
      html,
    })

    if (response.error) {
      throw new Error(response.error.message)
    }
  }
}
