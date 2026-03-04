const TRACKING_PARAMS = new Set([
  'gclid',
  'fbclid',
  'msclkid',
  'dclid',
  'ref',
  'source',
  'ved',
  'ei',
  'sa',
])

const shortenGoogleImageUrl = (url: URL): string | null => {
  const host = url.hostname.toLowerCase()

  if (!host.includes('google.')) {
    return null
  }

  if (url.pathname !== '/imgres') {
    return null
  }

  const originalImageUrl = url.searchParams.get('imgurl')

  if (!originalImageUrl) {
    return null
  }

  try {
    return new URL(originalImageUrl).toString()
  } catch {
    return null
  }
}

const removeTrackingParams = (url: URL): URL => {
  const keys = [...url.searchParams.keys()]

  for (const key of keys) {
    if (key.toLowerCase().startsWith('utm_') || TRACKING_PARAMS.has(key)) {
      url.searchParams.delete(key)
    }
  }

  return url
}

export const shortenUrl = (rawValue: string): string => {
  const value = rawValue.trim()

  if (!value) {
    return value
  }

  try {
    const parsed = new URL(value)

    const extractedGoogleImageUrl = shortenGoogleImageUrl(parsed)
    if (extractedGoogleImageUrl) {
      return extractedGoogleImageUrl
    }

    const sanitized = removeTrackingParams(parsed)
    sanitized.hash = ''

    if (sanitized.searchParams.toString() === '') {
      sanitized.search = ''
    }

    return sanitized.toString()
  } catch {
    return value
  }
}
