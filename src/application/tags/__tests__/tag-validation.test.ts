import {
  validateTagPayload,
  validateTagIds,
  buildTagSlug,
} from '../tag-validation'

describe('validateTagPayload', () => {
  it('should return valid data for a correct payload', () => {
    const { data, fieldErrors } = validateTagPayload({ name: 'Mathematics' })
    expect(data).not.toBeNull()
    expect(data!.name).toBe('Mathematics')
    expect(Object.keys(fieldErrors)).toHaveLength(0)
  })

  it('should trim the name', () => {
    const { data } = validateTagPayload({ name: '  Science  ' })
    expect(data!.name).toBe('Science')
  })

  it('should return fieldError when name is too short', () => {
    const { data, fieldErrors } = validateTagPayload({ name: 'A' })
    expect(data).toBeNull()
    expect(fieldErrors.name).toBe('LENGTH_INVALID')
  })

  it('should return fieldError when name is empty', () => {
    const { data, fieldErrors } = validateTagPayload({ name: '' })
    expect(data).toBeNull()
    expect(fieldErrors.name).toBe('LENGTH_INVALID')
  })

  it('should return fieldError when name is not a string', () => {
    const { data, fieldErrors } = validateTagPayload({ name: 123 })
    expect(data).toBeNull()
    expect(fieldErrors.name).toBe('LENGTH_INVALID')
  })

  it('should accept optional description', () => {
    const { data } = validateTagPayload({
      name: 'Tag',
      description: 'A description',
    })
    expect(data!.description).toBe('A description')
  })

  it('should reject description longer than 300 chars', () => {
    const { data, fieldErrors } = validateTagPayload({
      name: 'Tag',
      description: 'x'.repeat(301),
    })
    expect(data).toBeNull()
    expect(fieldErrors.description).toBe('LENGTH_INVALID')
  })

  it('should accept isActive boolean', () => {
    const { data } = validateTagPayload({ name: 'Tag', isActive: false })
    expect(data!.isActive).toBe(false)
  })

  it('should reject non-boolean isActive', () => {
    const { data, fieldErrors } = validateTagPayload({
      name: 'Tag',
      isActive: 'yes',
    })
    expect(data).toBeNull()
    expect(fieldErrors.isActive).toBe('INVALID')
  })

  it('should skip name validation in partial mode when name not provided', () => {
    const { data, fieldErrors } = validateTagPayload(
      { description: 'Updated' },
      true
    )
    expect(data).not.toBeNull()
    expect(Object.keys(fieldErrors)).toHaveLength(0)
    expect(data!.description).toBe('Updated')
  })

  it('should still validate name in partial mode when name is provided', () => {
    const { data, fieldErrors } = validateTagPayload({ name: 'X' }, true)
    expect(data).toBeNull()
    expect(fieldErrors.name).toBe('LENGTH_INVALID')
  })

  it('should handle null payload', () => {
    const { data, fieldErrors } = validateTagPayload(null)
    expect(data).toBeNull()
    expect(fieldErrors.name).toBe('LENGTH_INVALID')
  })

  it('should handle undefined payload', () => {
    const { data, fieldErrors } = validateTagPayload(undefined)
    expect(data).toBeNull()
    expect(fieldErrors.name).toBe('LENGTH_INVALID')
  })
})

describe('validateTagIds', () => {
  it('should return valid tagIds for an array of strings', () => {
    const { tagIds, fieldErrors } = validateTagIds(['id-1', 'id-2'])
    expect(tagIds).toEqual(['id-1', 'id-2'])
    expect(Object.keys(fieldErrors)).toHaveLength(0)
  })

  it('should deduplicate tagIds', () => {
    const { tagIds } = validateTagIds(['id-1', 'id-1'])
    // Dedup causes length mismatch, so it should fail
    expect(tagIds).toBeNull()
  })

  it('should return INVALID when not an array', () => {
    const { tagIds, fieldErrors } = validateTagIds('not-array')
    expect(tagIds).toBeNull()
    expect(fieldErrors.tagIds).toBe('INVALID')
  })

  it('should return INVALID when array contains non-strings', () => {
    const { tagIds, fieldErrors } = validateTagIds(['id-1', 123])
    expect(tagIds).toBeNull()
    expect(fieldErrors.tagIds).toBe('INVALID')
  })

  it('should accept an empty array', () => {
    const { tagIds, fieldErrors } = validateTagIds([])
    expect(tagIds).toEqual([])
    expect(Object.keys(fieldErrors)).toHaveLength(0)
  })
})

describe('buildTagSlug', () => {
  it('should convert to lowercase kebab-case', () => {
    expect(buildTagSlug('Hello World')).toBe('hello-world')
  })

  it('should remove accents', () => {
    expect(buildTagSlug('Matemática')).toBe('matematica')
  })

  it('should strip leading and trailing hyphens', () => {
    expect(buildTagSlug('--hello--')).toBe('hello')
  })

  it('should replace multiple non-alphanumeric chars with single hyphen', () => {
    expect(buildTagSlug('a   b___c')).toBe('a-b-c')
  })
})
