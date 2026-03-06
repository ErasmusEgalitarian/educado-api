export interface SendEmailInput {
  to: string
  subject: string
  html: string
}

export interface EmailProvider {
  send(data: SendEmailInput): Promise<void>
}
