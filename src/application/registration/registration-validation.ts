type FieldErrors = Record<string, string>

export type CreateRegistrationInput = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export type RegistrationProfileInput = {
  motivations: string
  academicBackground: string
  professionalExperience: string
}

export type LoginInput = {
  email: string
  password: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_POLICY_REGEX = /^(?=.*[A-Za-z]).{8,}$/

const PROFILE_LIMITS = {
  motivations: { min: 30, max: 2000 },
  academicBackground: { min: 20, max: 2000 },
  professionalExperience: { min: 20, max: 4000 },
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase()

export const validateCreateRegistrationInput = (
  payload: unknown
): { data: CreateRegistrationInput | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>

  const firstName = normalizeText(body.firstName)
  const lastName = normalizeText(body.lastName)
  const email = normalizeText(body.email)
  const password = normalizeText(body.password)
  const confirmPassword = normalizeText(body.confirmPassword)

  const fieldErrors: FieldErrors = {}

  if (!firstName) fieldErrors.firstName = 'REQUIRED'
  if (!lastName) fieldErrors.lastName = 'REQUIRED'
  if (!email || !EMAIL_REGEX.test(email)) fieldErrors.email = 'EMAIL_INVALID'
  if (!password || !PASSWORD_POLICY_REGEX.test(password)) {
    fieldErrors.password = 'PASSWORD_POLICY'
  }
  if (!confirmPassword || confirmPassword !== password) {
    fieldErrors.confirmPassword = 'PASSWORD_MISMATCH'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  return {
    data: {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    },
    fieldErrors,
  }
}

export const validateRegistrationProfileInput = (
  payload: unknown
): { data: RegistrationProfileInput | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>

  const motivations = normalizeText(body.motivations)
  const academicBackground = normalizeText(body.academicBackground)
  const professionalExperience = normalizeText(body.professionalExperience)

  const fieldErrors: FieldErrors = {}

  if (
    motivations.length < PROFILE_LIMITS.motivations.min ||
    motivations.length > PROFILE_LIMITS.motivations.max
  ) {
    fieldErrors.motivations = 'LENGTH_INVALID'
  }

  if (
    academicBackground.length < PROFILE_LIMITS.academicBackground.min ||
    academicBackground.length > PROFILE_LIMITS.academicBackground.max
  ) {
    fieldErrors.academicBackground = 'LENGTH_INVALID'
  }

  if (
    professionalExperience.length < PROFILE_LIMITS.professionalExperience.min ||
    professionalExperience.length > PROFILE_LIMITS.professionalExperience.max
  ) {
    fieldErrors.professionalExperience = 'LENGTH_INVALID'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  return {
    data: {
      motivations,
      academicBackground,
      professionalExperience,
    },
    fieldErrors,
  }
}

export const validateLoginInput = (
  payload: unknown
): { data: LoginInput | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>

  const email = normalizeText(body.email)
  const password = normalizeText(body.password)
  const fieldErrors: FieldErrors = {}

  if (!email || !EMAIL_REGEX.test(email)) fieldErrors.email = 'EMAIL_INVALID'
  if (!password) fieldErrors.password = 'REQUIRED'

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  return {
    data: { email, password },
    fieldErrors,
  }
}

export const validateRejectInput = (
  payload: unknown
): {
  data: { reason: string; notes?: string } | null
  fieldErrors: FieldErrors
} => {
  const body = (payload ?? {}) as Record<string, unknown>
  const reason = normalizeText(body.reason)
  const notes = normalizeText(body.notes)
  const fieldErrors: FieldErrors = {}

  if (!reason) {
    fieldErrors.reason = 'REQUIRED'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  return {
    data: notes ? { reason, notes } : { reason },
    fieldErrors,
  }
}
