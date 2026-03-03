import { AppError } from '../application/common/app-error'

let hasWarnedInsecureDevSecret = false

export const getAccessTokenSecret = (): string => {
  const configuredSecret =
    process.env.ACCESS_TOKEN_SECRET ?? process.env.JWT_SECRET

  if (configuredSecret && configuredSecret.trim() !== '') {
    return configuredSecret
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!hasWarnedInsecureDevSecret) {
      hasWarnedInsecureDevSecret = true
      console.warn(
        '[auth] ACCESS_TOKEN_SECRET/JWT_SECRET não configurado; usando segredo temporário de desenvolvimento.'
      )
    }
    return 'dev-insecure-secret-change-me'
  }

  throw new AppError(500, { code: 'MISSING_ACCESS_TOKEN_SECRET' })
}
