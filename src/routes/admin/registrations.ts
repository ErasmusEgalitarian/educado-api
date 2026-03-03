import { Request, Response, Router } from 'express'
import { AppError } from '../../application/common/app-error'
import {
  approveRegistration,
  ensureAdminRole,
  listRegistrationsForAdmin,
  rejectRegistration,
} from '../../application/registration/registration-service'
import { REGISTRATION_STATUSES } from '../../domain/registration/enums'
import { getAuthContext, requireAuth } from '../../interface/http/middlewares/auth-jwt'
import { validateRejectInput } from '../../application/registration/registration-validation'
import { requireParam } from '../../utils/request-params'

export const adminRegistrationsRouter = Router()

const handleError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.payload)
  }

  console.error('Unexpected admin route error', error)
  return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
}

adminRegistrationsRouter.get(
  '/registrations',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { role } = getAuthContext(res)
      ensureAdminRole(role)

      const statusParam =
        typeof req.query.status === 'string' ? req.query.status : undefined
      const status = REGISTRATION_STATUSES.includes(
        statusParam as (typeof REGISTRATION_STATUSES)[number]
      )
        ? (statusParam as (typeof REGISTRATION_STATUSES)[number])
        : undefined

      const response = await listRegistrationsForAdmin(status)

      return res.status(200).json(response)
    } catch (error) {
      return handleError(res, error)
    }
  }
)

adminRegistrationsRouter.post(
  '/registrations/:userId/approve',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { role, userId: reviewerUserId } = getAuthContext(res)
      ensureAdminRole(role)

      const targetUserId = requireParam(req.params.userId)

      const response = await approveRegistration(targetUserId, reviewerUserId)
      return res.status(200).json(response)
    } catch (error) {
      return handleError(res, error)
    }
  }
)

adminRegistrationsRouter.post(
  '/registrations/:userId/reject',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { role, userId: reviewerUserId } = getAuthContext(res)
      ensureAdminRole(role)

      const targetUserId = requireParam(req.params.userId)

      const validation = validateRejectInput(req.body)

      if (!validation.data) {
        return res.status(422).json({
          code: 'VALIDATION_ERROR',
          fieldErrors: validation.fieldErrors,
        })
      }

      const response = await rejectRegistration(
        targetUserId,
        reviewerUserId,
        validation.data
      )
      return res.status(200).json(response)
    } catch (error) {
      return handleError(res, error)
    }
  }
)
