import { Router } from 'express'
import { requireAuth } from '../../interface/http/middlewares/auth-jwt'
import {
  institutionsCreate,
  institutionsDelete,
  institutionsGetById,
  institutionsList,
  institutionsUpdate,
} from './institutions-crud'

export const institutionsRouter = Router()

institutionsRouter.use(requireAuth)

institutionsRouter.get('/', institutionsList)
institutionsRouter.get('/:id', institutionsGetById)
institutionsRouter.post('/', institutionsCreate)
institutionsRouter.put('/:id', institutionsUpdate)
institutionsRouter.delete('/:id', institutionsDelete)
