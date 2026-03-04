type UserAccessContext = {
  userId: string
  role: 'USER' | 'ADMIN'
}

type MediaOwner = {
  ownerId: string
}

export const canAccessMedia = (user: UserAccessContext, media: MediaOwner) => {
  if (user.role === 'ADMIN') {
    return true
  }

  return media.ownerId === user.userId
}
