const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type StudentRegistrationInput = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: string
  deviceId?: string
}

export type StudentProfileUpdateInput = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  avatarMediaId?: string | null
}

type FieldErrors = Record<string, string>

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export const validateStudentRegistration = (
  payload: unknown
): { data: StudentRegistrationInput | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>
  const fieldErrors: FieldErrors = {}

  const firstName = normalizeText(body.firstName)
  const lastName = normalizeText(body.lastName)

  if (firstName.length < 2 || firstName.length > 100) {
    fieldErrors.firstName = 'LENGTH_INVALID'
  }

  if (lastName.length < 2 || lastName.length > 100) {
    fieldErrors.lastName = 'LENGTH_INVALID'
  }

  let email: string | undefined
  if (body.email !== undefined && body.email !== null && body.email !== '') {
    email = normalizeText(body.email)
    if (!EMAIL_REGEX.test(email)) {
      fieldErrors.email = 'FORMAT_INVALID'
    }
  }

  let phone: string | undefined
  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    phone = normalizeText(body.phone)
    if (phone.length < 8 || phone.length > 20) {
      fieldErrors.phone = 'LENGTH_INVALID'
    }
  }

  let dateOfBirth: string | undefined
  if (
    body.dateOfBirth !== undefined &&
    body.dateOfBirth !== null &&
    body.dateOfBirth !== ''
  ) {
    dateOfBirth = normalizeText(body.dateOfBirth)
    const parsed = new Date(dateOfBirth)
    if (isNaN(parsed.getTime())) {
      fieldErrors.dateOfBirth = 'FORMAT_INVALID'
    } else if (parsed >= new Date()) {
      fieldErrors.dateOfBirth = 'MUST_BE_PAST'
    }
  }

  let deviceId: string | undefined
  if (
    body.deviceId !== undefined &&
    body.deviceId !== null &&
    body.deviceId !== ''
  ) {
    deviceId = normalizeText(body.deviceId)
    if (deviceId.length < 1 || deviceId.length > 255) {
      fieldErrors.deviceId = 'LENGTH_INVALID'
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  return {
    data: {
      firstName,
      lastName,
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(dateOfBirth !== undefined ? { dateOfBirth } : {}),
      ...(deviceId !== undefined ? { deviceId } : {}),
    },
    fieldErrors,
  }
}

export const validateStudentProfileUpdate = (
  payload: unknown
): { data: StudentProfileUpdateInput | null; fieldErrors: FieldErrors } => {
  const body = (payload ?? {}) as Record<string, unknown>
  const fieldErrors: FieldErrors = {}
  const data: StudentProfileUpdateInput = {}

  if (body.firstName !== undefined) {
    const firstName = normalizeText(body.firstName)
    if (firstName.length < 2 || firstName.length > 100) {
      fieldErrors.firstName = 'LENGTH_INVALID'
    } else {
      data.firstName = firstName
    }
  }

  if (body.lastName !== undefined) {
    const lastName = normalizeText(body.lastName)
    if (lastName.length < 2 || lastName.length > 100) {
      fieldErrors.lastName = 'LENGTH_INVALID'
    } else {
      data.lastName = lastName
    }
  }

  if (body.email !== undefined) {
    if (body.email === null || body.email === '') {
      data.email = undefined
    } else {
      const email = normalizeText(body.email)
      if (!EMAIL_REGEX.test(email)) {
        fieldErrors.email = 'FORMAT_INVALID'
      } else {
        data.email = email
      }
    }
  }

  if (body.phone !== undefined) {
    if (body.phone === null || body.phone === '') {
      data.phone = undefined
    } else {
      const phone = normalizeText(body.phone)
      if (phone.length < 8 || phone.length > 20) {
        fieldErrors.phone = 'LENGTH_INVALID'
      } else {
        data.phone = phone
      }
    }
  }

  if (body.dateOfBirth !== undefined) {
    if (body.dateOfBirth === null || body.dateOfBirth === '') {
      data.dateOfBirth = undefined
    } else {
      const dateOfBirth = normalizeText(body.dateOfBirth)
      const parsed = new Date(dateOfBirth)
      if (isNaN(parsed.getTime())) {
        fieldErrors.dateOfBirth = 'FORMAT_INVALID'
      } else if (parsed >= new Date()) {
        fieldErrors.dateOfBirth = 'MUST_BE_PAST'
      } else {
        data.dateOfBirth = dateOfBirth
      }
    }
  }

  if (body.avatarMediaId !== undefined) {
    if (body.avatarMediaId === null || body.avatarMediaId === '') {
      data.avatarMediaId = null
    } else {
      const avatarMediaId = normalizeText(body.avatarMediaId)
      if (avatarMediaId.length > 255) {
        fieldErrors.avatarMediaId = 'LENGTH_INVALID'
      } else {
        data.avatarMediaId = avatarMediaId
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  return { data, fieldErrors }
}
