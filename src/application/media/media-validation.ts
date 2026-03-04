export const validateImageType = (mime: string) => {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(mime)
}

export const validateVideoType = (mime: string) => {
  return ['video/mp4', 'video/webm', 'video/quicktime'].includes(mime)
}

type MediaMetadata = {
  title: string
  altText: string
  description: string
}

export const validateMediaMetadata = (
  body: Record<string, unknown>
): {
  data?: MediaMetadata
  fieldErrors?: Record<string, string>
} => {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const altText = typeof body.altText === 'string' ? body.altText.trim() : ''
  const description =
    typeof body.description === 'string' ? body.description.trim() : ''

  const fieldErrors: Record<string, string> = {}

  if (!title) {
    fieldErrors.title = 'REQUIRED'
  }

  if (!altText) {
    fieldErrors.altText = 'REQUIRED'
  }

  if (!description) {
    fieldErrors.description = 'REQUIRED'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  return {
    data: {
      title,
      altText,
      description,
    },
  }
}
