import { Router } from 'express'
import { requireAuth } from '../../interface/http/middlewares/auth-jwt'
import uploadImage from './upload-image'
import uploadVideo from './upload-video'
import getImage from './get-image'
import getVideo from './get-video'
import updateMetadata from './update-metadata'
import stream from './stream'

const router = Router()

// Stream route supports token via query param (for <img> tags)
// so it's mounted before requireAuth
router.use(stream)

router.use(requireAuth)

router.use(uploadImage)
router.use(uploadVideo)
router.use(getImage)
router.use(getVideo)
router.use(updateMetadata)

export default router
