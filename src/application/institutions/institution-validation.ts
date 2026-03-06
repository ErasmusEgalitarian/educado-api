type FieldErrors = Record<string, string>

export type InstitutionInput = {
  name: string
  domain: string
  secondaryDomain?: string
  isActive?: boolean
}

export type InstitutionUpdateInput = {
  name?: string
  domain?: string
  secondaryDomain?: string
  isActive?: boolean
}

const DOMAIN_REGEX = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const normalizeDomain = (value: unknown): string => {
  return normalizeText(value).replace(/^@+/, '').toLowerCase()
}

export const validateInstitutionPayload = (
  payload: unknown,
  partial = false
): {
  data: InstitutionInput | InstitutionUpdateInput | null
  fieldErrors: FieldErrors
} => {
  const body = (payload ?? {}) as Record<string, unknown>

  const nameRaw = body.name
  const domainRaw = body.domain
  const secondaryDomainRaw = body.secondaryDomain
  const isActiveRaw = body.isActive

  const name = normalizeText(nameRaw)
  const domain = normalizeDomain(domainRaw)
  const secondaryDomain = normalizeDomain(secondaryDomainRaw)
  const hasSecondaryDomainInput =
    typeof secondaryDomainRaw === 'string' && secondaryDomainRaw.trim() !== ''
  const isActive = typeof isActiveRaw === 'boolean' ? isActiveRaw : undefined

  const fieldErrors: FieldErrors = {}

  if (!partial || nameRaw !== undefined) {
    if (!name) {
      fieldErrors.name = 'REQUIRED'
    }
  }

  if (!partial || domainRaw !== undefined) {
    if (!domain) {
      fieldErrors.domain = 'REQUIRED'
    } else if (!DOMAIN_REGEX.test(domain)) {
      fieldErrors.domain = 'INVALID_FORMAT'
    }
  }

  if (!partial || secondaryDomainRaw !== undefined) {
    if (
      hasSecondaryDomainInput &&
      !secondaryDomain
    ) {
      fieldErrors.secondaryDomain = 'INVALID_FORMAT'
    } else if (secondaryDomain && !DOMAIN_REGEX.test(secondaryDomain)) {
      fieldErrors.secondaryDomain = 'INVALID_FORMAT'
    }
  }

  if (
    (!partial || isActiveRaw !== undefined) &&
    isActiveRaw !== undefined &&
    typeof isActiveRaw !== 'boolean'
  ) {
    fieldErrors.isActive = 'INVALID_TYPE'
  }

  const effectiveDomain = domain || undefined
  const effectiveSecondaryDomain = secondaryDomain || undefined

  if (
    effectiveDomain &&
    effectiveSecondaryDomain &&
    effectiveDomain === effectiveSecondaryDomain
  ) {
    fieldErrors.secondaryDomain = 'MUST_DIFFER_FROM_DOMAIN'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  const data: InstitutionInput = {
    name,
    domain,
  }

  if (effectiveSecondaryDomain) {
    data.secondaryDomain = effectiveSecondaryDomain
  }

  if (isActive !== undefined) {
    data.isActive = isActive
  }

  if (partial) {
    const partialData: Partial<InstitutionInput> = {}

    if (nameRaw !== undefined) {
      partialData.name = name
    }

    if (domainRaw !== undefined) {
      partialData.domain = domain
    }

    if (secondaryDomainRaw !== undefined) {
      if (effectiveSecondaryDomain) {
        partialData.secondaryDomain = effectiveSecondaryDomain
      } else {
        partialData.secondaryDomain = undefined
      }
    }

    if (isActiveRaw !== undefined && isActive !== undefined) {
      partialData.isActive = isActive
    }

    return {
      data: partialData as InstitutionUpdateInput,
      fieldErrors,
    }
  }

  return {
    data,
    fieldErrors,
  }
}
