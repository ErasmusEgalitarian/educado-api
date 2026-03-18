type PasswordResetCodeTemplateInput = {
  firstName?: string
  code: string
}

export const passwordResetCodeTemplate = ({
  firstName,
  code,
}: PasswordResetCodeTemplateInput) => {
  const safeFirstName = firstName?.trim()
  const greeting = safeFirstName ? `Olá, ${safeFirstName}!` : 'Olá!'

  return {
    subject: 'Código de redefinição de senha',
    html: `
      <h1>${greeting}</h1>
      <p>Você solicitou a redefinição de sua senha. Use o código abaixo:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>Esse código expira em 15 minutos.</p>
      <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
    `,
  }
}
