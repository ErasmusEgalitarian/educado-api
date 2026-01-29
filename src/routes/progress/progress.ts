import { Router } from 'express'
import { progressList } from './progress-list'
import { progressGet } from './progress-get'
import { progressSaveSection } from './progress-save-section'
import { progressComplete } from './progress-complete'

export const progressRouter = Router()

// GET /progress/:username/courses - Get all course progress for a user
progressRouter.get('/:username/courses', progressList)

// GET /progress/:username/courses/:courseId - Get specific course progress with section details
progressRouter.get('/:username/courses/:courseId', progressGet)

// POST /progress/:username/courses/:courseId/sections/:sectionId - Save/update section progress
progressRouter.post(
  '/:username/courses/:courseId/sections/:sectionId',
  progressSaveSection
)

// PUT /progress/:username/courses/:courseId/complete - Mark course as completed
progressRouter.put('/:username/courses/:courseId/complete', progressComplete)
