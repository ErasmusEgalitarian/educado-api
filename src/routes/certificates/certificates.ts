import { Router } from 'express'
import { certificatesList } from './certificates-list'
import { certificatesCreate } from './certificates-create'

export const certificatesRouter = Router()

// GET /certificates/:deviceId - Get all certificates for a device
certificatesRouter.get('/:deviceId', certificatesList)

// POST /certificates - Create a certificate
certificatesRouter.post('/', certificatesCreate)
