type EmailVerificationCodeTemplateInput = {
  firstName?: string
  code: string
}

export const emailVerificationCodeTemplate = ({
  firstName,
  code,
}: EmailVerificationCodeTemplateInput) => {
  const safeFirstName = firstName?.trim()
  const greeting = safeFirstName ? `Olá, ${safeFirstName}!` : 'Olá!'

  return {
    subject: 'Seu código de verificação',
    html: `
      <h1>${greeting}</h1>
      <p>Use o código abaixo para concluir sua verificação de e-mail:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>Esse código expira em 15 minutos.</p>
    `,
  }
}
