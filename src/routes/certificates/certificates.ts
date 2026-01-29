import { Router } from 'express'
import { certificatesList } from './certificates-list'
import { certificatesCreate } from './certificates-create'

export const certificatesRouter = Router()

// GET /certificates/:username - Get all certificates for a user
certificatesRouter.get('/:username', certificatesList)

// POST /certificates - Create a certificate
certificatesRouter.post('/', certificatesCreate)
