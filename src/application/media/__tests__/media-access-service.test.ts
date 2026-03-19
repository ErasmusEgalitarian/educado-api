import { canAccessMedia } from '../media-access-service'

describe('canAccessMedia', () => {
  it('should allow ADMIN to access any media', () => {
    expect(
      canAccessMedia(
        { userId: 'admin-1', role: 'ADMIN' },
        { ownerId: 'user-99' }
      )
    ).toBe(true)
  })

  it('should allow ADMIN to access media even when ownerId does not match', () => {
    expect(
      canAccessMedia(
        { userId: 'admin-1', role: 'ADMIN' },
        { ownerId: 'admin-1' }
      )
    ).toBe(true)
  })

  it('should allow USER to access their own media', () => {
    expect(
      canAccessMedia({ userId: 'user-1', role: 'USER' }, { ownerId: 'user-1' })
    ).toBe(true)
  })

  it('should deny USER access to media owned by someone else', () => {
    expect(
      canAccessMedia({ userId: 'user-1', role: 'USER' }, { ownerId: 'user-2' })
    ).toBe(false)
  })

  it('should deny USER access when ownerId is empty', () => {
    expect(
      canAccessMedia({ userId: 'user-1', role: 'USER' }, { ownerId: '' })
    ).toBe(false)
  })

  it('should deny USER access when userId is empty but ownerId is not', () => {
    expect(
      canAccessMedia({ userId: '', role: 'USER' }, { ownerId: 'user-1' })
    ).toBe(false)
  })

  it('should allow USER when both userId and ownerId are empty strings', () => {
    expect(canAccessMedia({ userId: '', role: 'USER' }, { ownerId: '' })).toBe(
      true
    )
  })
})
