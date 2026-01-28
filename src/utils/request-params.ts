/**
 * Validate and return a required string parameter
 * Throws an error if parameter is missing or empty
 * Handles Express req.params type (string | string[])
 */
export function requireParam(value: string | string[] | undefined): string {
  // Handle array case (should not happen in normal routes but Express types allow it)
  if (Array.isArray(value)) {
    value = value[0]
  }

  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error('Missing required parameter')
  }
  return value
}

/**
 * Validate and return an optional string parameter
 * Returns undefined if parameter is missing
 * Handles Express req.params type (string | string[])
 */
export function optionalParam(
  value: string | string[] | undefined
): string | undefined {
  // Handle array case
  if (Array.isArray(value)) {
    value = value[0]
  }

  if (!value || typeof value !== 'string' || value.trim() === '') {
    return undefined
  }
  return value
}

/**
 * Validate and return a required number parameter
 * Throws an error if parameter is missing or not a valid number
 * Handles Express req.params type (string | string[])
 */
export function requireNumberParam(
  value: string | string[] | undefined
): number {
  const stringValue = requireParam(value)
  const parsed = Number(stringValue)

  if (isNaN(parsed)) {
    throw new Error('Invalid number parameter')
  }

  return parsed
}

/**
 * Validate and return an optional number parameter
 * Returns undefined if parameter is missing or not a valid number
 * Handles Express req.params type (string | string[])
 */
export function optionalNumberParam(
  value: string | string[] | undefined
): number | undefined {
  const stringValue = optionalParam(value)
  if (!stringValue) return undefined

  const parsed = Number(stringValue)
  return isNaN(parsed) ? undefined : parsed
}
