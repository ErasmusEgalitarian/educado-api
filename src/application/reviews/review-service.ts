import { fn, col } from 'sequelize'
import { AppError } from '../common/app-error'
import { Course, Enrollment, CourseReview, User } from '../../models/index'
import { ReviewInput } from './review-validation'
import { awardPoints } from '../gamification/gamification-service'

export const submitReview = async (userId: string, input: ReviewInput) => {
  const enrollment = await Enrollment.findOne({
    where: { userId, courseId: input.courseId, status: 'COMPLETED' },
  })

  if (!enrollment) {
    throw new AppError(403, { code: 'COURSE_NOT_COMPLETED' })
  }

  const existingReview = await CourseReview.findOne({
    where: { userId, courseId: input.courseId },
  })

  if (existingReview) {
    throw new AppError(409, { code: 'ALREADY_REVIEWED' })
  }

  const review = await CourseReview.create({
    userId,
    courseId: input.courseId,
    rating: input.rating,
    tags: input.tags,
    comment: input.comment,
  })

  // Recalculate course rating
  const avgResult = (await CourseReview.findOne({
    where: { courseId: input.courseId },
    attributes: [[fn('AVG', col('rating')), 'avgRating']],
    raw: true,
  })) as unknown as { avgRating: string } | null

  if (avgResult) {
    const avgRating = parseFloat(avgResult.avgRating)
    await Course.update(
      { rating: Math.round(avgRating * 10) / 10 },
      { where: { id: input.courseId } }
    )
  }

  // Award gamification points
  try {
    await awardPoints(userId, 'REVIEW_SUBMITTED', input.courseId)
  } catch {
    // Non-critical: don't fail review submission if gamification errors
  }

  return {
    id: review.id,
    rating: review.rating,
    tags: review.tags,
    comment: review.comment,
  }
}

export const getCourseReviews = async (
  courseId: string,
  page = 1,
  limit = 20
) => {
  const offset = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit))

  const { rows, count } = await CourseReview.findAndCountAll({
    where: { courseId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'avatarMediaId'],
      },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit: Math.min(100, Math.max(1, limit)),
  })

  return {
    items: rows.map((review) => {
      const user = review.get('user') as User | null
      return {
        id: review.id,
        rating: review.rating,
        tags: review.tags,
        comment: review.comment,
        createdAt: review.createdAt,
        user: user
          ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              avatarMediaId: user.avatarMediaId,
            }
          : null,
      }
    }),
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    total: count,
  }
}

export const getReviewSummary = async (courseId: string) => {
  const reviews = await CourseReview.findAll({
    where: { courseId },
    attributes: ['rating'],
  })

  const total = reviews.length
  if (total === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sum = 0

  for (const review of reviews) {
    sum += review.rating
    distribution[review.rating] = (distribution[review.rating] || 0) + 1
  }

  return {
    averageRating: Math.round((sum / total) * 10) / 10,
    totalReviews: total,
    distribution,
  }
}
