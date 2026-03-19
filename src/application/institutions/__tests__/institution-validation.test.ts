import { validateInstitutionPayload } from '../institution-validation'

describe('validateInstitutionPayload', () => {
  it('should return valid data for correct payload', () => {
    const { data, fieldErrors } = validateInstitutionPayload({
      name: 'University of Test',
      domain: 'test.edu',
    })
    expect(data).not.toBeNull()
    expect(data!.name).toBe('University of Test')
    expect(data!.domain).toBe('test.edu')
    expect(Object.keys(fieldErrors)).toHaveLength(0)
  })

  it('should normalize domain to lowercase and strip leading @', () => {
    const { data } = validateInstitutionPayload({
      name: 'Uni',
      domain: '@Test.EDU',
    })
    expect(data!.domain).toBe('test.edu')
  })

  it('should require name', () => {
    const { data, fieldErrors } = validateInstitutionPayload({
      name: '',
      domain: 'test.edu',
    })
    expect(data).toBeNull()
    expect(fieldErrors.name).toBe('REQUIRED')
  })

  it('should require domain', () => {
    const { data, fieldErrors } = validateInstitutionPayload({
      name: 'Uni',
      domain: '',
    })
    expect(data).toBeNull()
    expect(fieldErrors.domain).toBe('REQUIRED')
  })

  it('should reject invalid domain format', () => {
    const { data, fieldErrors } = validateInstitutionPayload({
      name: 'Uni',
      domain: 'not-a-domain',
    })
    expect(data).toBeNull()
    expect(fieldErrors.domain).toBe('INVALID_FORMAT')
  })

  it('should accept valid secondaryDomain', () => {
    const { data } = validateInstitutionPayload({
      name: 'Uni',
      domain: 'test.edu',
      secondaryDomain: 'alt.test.edu',
    })
    expect(data!.secondaryDomain).toBe('alt.test.edu')
  })

  it('should reject secondaryDomain same as domain', () => {
    const { data, fieldErrors } = validateInstitutionPayload({
      name: 'Uni',
      domain: 'test.edu',
      secondaryDomain: 'test.edu',
    })
    expect(data).toBeNull()
    expect(fieldErrors.secondaryDomain).toBe('MUST_DIFFER_FROM_DOMAIN')
  })

  it('should reject invalid secondaryDomain format', () => {
    const { data, fieldErrors } = validateInstitutionPayload({
      name: 'Uni',
      domain: 'test.edu',
      secondaryDomain: 'invalid',
    })
    expect(data).toBeNull()
    expect(fieldErrors.secondaryDomain).toBe('INVALID_FORMAT')
  })

  it('should accept boolean isActive', () => {
    const { data } = validateInstitutionPayload({
      name: 'Uni',
      domain: 'test.edu',
      isActive: true,
    })
    expect(data!.isActive).toBe(true)
  })

  it('should reject non-boolean isActive', () => {
    const { data, fieldErrors } = validateInstitutionPayload({
      name: 'Uni',
      domain: 'test.edu',
      isActive: 'yes',
    })
    expect(data).toBeNull()
    expect(fieldErrors.isActive).toBe('INVALID_TYPE')
  })

  it('should handle partial mode - skip name and domain when not provided', () => {
    const { data, fieldErrors } = validateInstitutionPayload(
      { isActive: false },
      true
    )
    expect(Object.keys(fieldErrors)).toHaveLength(0)
    expect(data).not.toBeNull()
  })

  it('should validate name in partial mode when provided', () => {
    const { data, fieldErrors } = validateInstitutionPayload({ name: '' }, true)
    expect(data).toBeNull()
    expect(fieldErrors.name).toBe('REQUIRED')
  })

  it('should validate domain in partial mode when provided', () => {
    const { data, fieldErrors } = validateInstitutionPayload(
      { domain: 'bad' },
      true
    )
    expect(data).toBeNull()
    expect(fieldErrors.domain).toBe('INVALID_FORMAT')
  })

  it('should handle null payload', () => {
    const { data, fieldErrors } = validateInstitutionPayload(null)
    expect(data).toBeNull()
    expect(fieldErrors.name).toBe('REQUIRED')
    expect(fieldErrors.domain).toBe('REQUIRED')
  })

  it('should return INVALID_FORMAT for secondaryDomain that is non-empty string but trims to empty after normalization', () => {
    const { data, fieldErrors } = validateInstitutionPayload({
      name: 'Uni',
      domain: 'test.edu',
      secondaryDomain: '@',
    })
    expect(data).toBeNull()
    expect(fieldErrors.secondaryDomain).toBe('INVALID_FORMAT')
  })

  it('should return partial data with name only in partial mode', () => {
    const { data, fieldErrors } = validateInstitutionPayload(
      { name: 'Updated Uni' },
      true
    )
    expect(Object.keys(fieldErrors)).toHaveLength(0)
    expect(data).not.toBeNull()
    expect((data as Record<string, unknown>).name).toBe('Updated Uni')
    expect((data as Record<string, unknown>).domain).toBeUndefined()
  })

  it('should return partial data with domain only in partial mode', () => {
    const { data, fieldErrors } = validateInstitutionPayload(
      { domain: 'new.edu' },
      true
    )
    expect(Object.keys(fieldErrors)).toHaveLength(0)
    expect(data).not.toBeNull()
    expect((data as Record<string, unknown>).domain).toBe('new.edu')
    expect((data as Record<string, unknown>).name).toBeUndefined()
  })

  it('should clear secondaryDomain in partial mode when provided as empty string', () => {
    const { data, fieldErrors } = validateInstitutionPayload(
      { secondaryDomain: '' },
      true
    )
    expect(Object.keys(fieldErrors)).toHaveLength(0)
    expect(data).not.toBeNull()
    expect((data as Record<string, unknown>).secondaryDomain).toBeUndefined()
  })

  it('should set secondaryDomain in partial mode when provided as valid domain', () => {
    const { data, fieldErrors } = validateInstitutionPayload(
      { secondaryDomain: 'alt.edu' },
      true
    )
    expect(Object.keys(fieldErrors)).toHaveLength(0)
    expect(data).not.toBeNull()
    expect((data as Record<string, unknown>).secondaryDomain).toBe('alt.edu')
  })

  it('should set isActive in partial mode when provided', () => {
    const { data, fieldErrors } = validateInstitutionPayload(
      { isActive: true },
      true
    )
    expect(Object.keys(fieldErrors)).toHaveLength(0)
    expect(data).not.toBeNull()
    expect((data as Record<string, unknown>).isActive).toBe(true)
  })
})
