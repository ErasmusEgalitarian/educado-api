type FieldErrors = Record<string, string>

type ConfirmEmailVerificationInput = {
  code: string
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export const validateConfirmEmailVerificationInput = (
  payload: unknown
): { data: ConfirmEmailVerificationInput | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>
  const code = normalizeText(body.code)
  const fieldErrors: FieldErrors = {}

  if (!code) {
    fieldErrors.code = 'REQUIRED'
  } else if (!/^\d{6}$/.test(code)) {
    fieldErrors.code = 'INVALID_CODE'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  return {
    data: {
      code,
    },
    fieldErrors,
  }
}
