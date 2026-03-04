export type MediaKind = 'image' | 'video'

export type MediaStatus = 'ACTIVE' | 'INACTIVE'

export interface MediaDocument {
  _id?: string
  ownerId: string
  kind: MediaKind
  filename: string
  contentType: string
  size: number
  gridFsId: string
  status: MediaStatus
  createdAt: Date
  updatedAt: Date
}
