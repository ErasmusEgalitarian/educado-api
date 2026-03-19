import {
  validateImageType,
  validateVideoType,
  validateMediaMetadata,
} from '../media-validation'

describe('validateImageType', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])(
    'should accept %s',
    (mime) => {
      expect(validateImageType(mime)).toBe(true)
    }
  )

  it.each([
    'image/gif',
    'image/svg+xml',
    'image/bmp',
    'application/pdf',
    'video/mp4',
    '',
  ])('should reject %s', (mime) => {
    expect(validateImageType(mime)).toBe(false)
  })
})

describe('validateVideoType', () => {
  it.each(['video/mp4', 'video/webm', 'video/quicktime'])(
    'should accept %s',
    (mime) => {
      expect(validateVideoType(mime)).toBe(true)
    }
  )

  it.each([
    'video/avi',
    'video/mkv',
    'image/jpeg',
    'application/octet-stream',
    '',
  ])('should reject %s', (mime) => {
    expect(validateVideoType(mime)).toBe(false)
  })
})

describe('validateMediaMetadata', () => {
  const validMetadata = {
    title: 'My Image',
    altText: 'An image of something',
    description: 'A detailed description',
  }

  it('should return data when all fields are valid', () => {
    const result = validateMediaMetadata(validMetadata)
    expect(result.data).toEqual(validMetadata)
    expect(result.fieldErrors).toBeUndefined()
  })

  it('should trim whitespace from all fields', () => {
    const result = validateMediaMetadata({
      title: '  My Image  ',
      altText: '  Alt text  ',
      description: '  Description  ',
    })
    expect(result.data).toEqual({
      title: 'My Image',
      altText: 'Alt text',
      description: 'Description',
    })
  })

  it('should return REQUIRED when title is empty', () => {
    const result = validateMediaMetadata({ ...validMetadata, title: '' })
    expect(result.fieldErrors?.title).toBe('REQUIRED')
    expect(result.data).toBeUndefined()
  })

  it('should return REQUIRED when altText is empty', () => {
    const result = validateMediaMetadata({ ...validMetadata, altText: '' })
    expect(result.fieldErrors?.altText).toBe('REQUIRED')
  })

  it('should return REQUIRED when description is empty', () => {
    const result = validateMediaMetadata({ ...validMetadata, description: '' })
    expect(result.fieldErrors?.description).toBe('REQUIRED')
  })

  it('should return multiple errors for multiple missing fields', () => {
    const result = validateMediaMetadata({})
    expect(result.fieldErrors?.title).toBe('REQUIRED')
    expect(result.fieldErrors?.altText).toBe('REQUIRED')
    expect(result.fieldErrors?.description).toBe('REQUIRED')
  })

  it('should return REQUIRED when title is only whitespace', () => {
    const result = validateMediaMetadata({ ...validMetadata, title: '   ' })
    expect(result.fieldErrors?.title).toBe('REQUIRED')
  })

  it('should treat non-string values as empty', () => {
    const result = validateMediaMetadata({
      title: 123,
      altText: null,
      description: undefined,
    })
    expect(result.fieldErrors?.title).toBe('REQUIRED')
    expect(result.fieldErrors?.altText).toBe('REQUIRED')
    expect(result.fieldErrors?.description).toBe('REQUIRED')
  })
})
