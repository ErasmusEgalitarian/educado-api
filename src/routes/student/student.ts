import { Router } from 'express'
import { studentAuthRouter } from './auth'
import { studentProfileRouter } from './profile'
import { studentEnrollmentsRouter } from './enrollments'
import { studentProgressRouter } from './progress'
import { studentActivitiesRouter } from './activities'
import { studentGamificationRouter } from './gamification'
import { studentReviewsRouter } from './reviews'
import { studentCertificatesRouter } from './certificates'

const router = Router()

router.use('/auth', studentAuthRouter)
router.use('/', studentProfileRouter)
router.use('/enrollments', studentEnrollmentsRouter)
router.use('/progress', studentProgressRouter)
router.use('/activities', studentActivitiesRouter)
router.use('/gamification', studentGamificationRouter)
router.use('/reviews', studentReviewsRouter)
router.use('/certificates', studentCertificatesRouter)

export const studentRouter = router
