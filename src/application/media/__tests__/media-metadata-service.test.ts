jest.mock('../../../models', () => ({
  MediaAsset: {
    findByPk: jest.fn(),
  },
}))

import { AppError } from '../../common/app-error'
import { MediaAsset } from '../../../models'
import { updateMediaMetadata, getMediaMetadata } from '../media-metadata-service'

describe('updateMediaMetadata', () => {
  it('should find by PK and update fields', async () => {
    const existing = {
      id: 'media-1',
      title: 'old',
      altText: 'old alt',
      description: 'old desc',
      update: jest.fn().mockResolvedValue(undefined),
    }
    ;(MediaAsset.findByPk as jest.Mock).mockResolvedValue(existing)

    const result = await updateMediaMetadata({
      id: 'media-1',
      title: 'New Title',
      altText: 'New Alt',
      description: 'New Desc',
    })

    expect(MediaAsset.findByPk).toHaveBeenCalledWith('media-1')
    expect(existing.update).toHaveBeenCalledWith({
      title: 'New Title',
      altText: 'New Alt',
      description: 'New Desc',
    })
    expect(result).toBe(existing)
  })

  it('should throw MEDIA_METADATA_NOT_FOUND when asset does not exist', async () => {
    ;(MediaAsset.findByPk as jest.Mock).mockResolvedValue(null)

    try {
      await updateMediaMetadata({
        id: 'nonexistent',
        title: 'Title',
        altText: 'Alt',
        description: 'Desc',
      })
    } catch (e) {
      expect(e).toBeInstanceOf(AppError)
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('MEDIA_METADATA_NOT_FOUND')
    }
  })
})

describe('getMediaMetadata', () => {
  it('should return the media asset when found', async () => {
    const asset = { id: 'media-1', title: 'Photo' }
    ;(MediaAsset.findByPk as jest.Mock).mockResolvedValue(asset)

    const result = await getMediaMetadata('media-1')
    expect(result).toBe(asset)
    expect(MediaAsset.findByPk).toHaveBeenCalledWith('media-1')
  })

  it('should throw MEDIA_METADATA_NOT_FOUND when asset does not exist', async () => {
    ;(MediaAsset.findByPk as jest.Mock).mockResolvedValue(null)

    try {
      await getMediaMetadata('nonexistent')
    } catch (e) {
      expect(e).toBeInstanceOf(AppError)
      expect((e as AppError).statusCode).toBe(404)
      expect((e as AppError).payload.code).toBe('MEDIA_METADATA_NOT_FOUND')
    }
  })
})
