import { Router } from 'express'
import {
  sectionsCreate,
  sectionsUpdate,
  sectionsDelete,
} from './section-create'
import { sectionsGetById, sectionsList } from './section-list'

export const sectionsRouter = Router()

sectionsRouter.post('/', sectionsCreate)
sectionsRouter.get('/', sectionsList)
sectionsRouter.get('/:id', sectionsGetById)
sectionsRouter.put('/:id', sectionsUpdate)
sectionsRouter.delete('/:id', sectionsDelete)
