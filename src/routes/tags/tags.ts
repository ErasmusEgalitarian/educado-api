import { Router } from 'express'
import { requireAuth } from '../../interface/http/middlewares/auth-jwt'
import {
  tagsCreate,
  tagsDelete,
  tagsGetById,
  tagsList,
  tagsUpdate,
} from './tags-crud'

export const tagsRouter = Router()

tagsRouter.use(requireAuth)

tagsRouter.get('/', tagsList)
tagsRouter.get('/:id', tagsGetById)
tagsRouter.post('/', tagsCreate)
tagsRouter.put('/:id', tagsUpdate)
tagsRouter.delete('/:id', tagsDelete)
