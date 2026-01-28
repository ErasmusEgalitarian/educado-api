import { Router } from 'express'
import { progressList } from './progress-list'
import { progressGet } from './progress-get'
import { progressSaveSection } from './progress-save-section'
import { progressComplete } from './progress-complete'

export const progressRouter = Router()

// GET /progress/:deviceId/courses - Get all course progress for a device
progressRouter.get('/:deviceId/courses', progressList)

// GET /progress/:deviceId/courses/:courseId - Get specific course progress with section details
progressRouter.get('/:deviceId/courses/:courseId', progressGet)

// POST /progress/:deviceId/courses/:courseId/sections/:sectionId - Save/update section progress
progressRouter.post(
  '/:deviceId/courses/:courseId/sections/:sectionId',
  progressSaveSection
)

// PUT /progress/:deviceId/courses/:courseId/complete - Mark course as completed
progressRouter.put('/:deviceId/courses/:courseId/complete', progressComplete)
