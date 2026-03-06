type RegistrationApprovedTemplateInput = {
  firstName?: string
}

export const registrationApprovedTemplate = ({
  firstName,
}: RegistrationApprovedTemplateInput) => {
  const safeFirstName = firstName?.trim()
  const greeting = safeFirstName ? `Olá, ${safeFirstName}!` : 'Olá!'

  return {
    subject: 'Cadastro aprovado',
    html: `
      <h1>${greeting}</h1>
      <p>Seu cadastro foi aprovado e sua conta já pode ser utilizada.</p>
      <p>Agora você já pode fazer login e começar seus estudos na plataforma.</p>
    `,
  }
}
