import { Request, Response, Router } from 'express'
import { AppError } from '../../application/common/app-error'
import {
  approveRegistration,
  deleteUserByAdmin,
  ensureAdminRole,
  getUserByIdForAdmin,
  listRegistrationsForAdmin,
  listUsersForAdmin,
  rejectRegistration,
  toggleUserRoleByAdmin,
} from '../../application/registration/registration-service'
import { REGISTRATION_STATUSES } from '../../domain/registration/enums'
import {
  getAuthContext,
  requireAuth,
} from '../../interface/http/middlewares/auth-jwt'
import { validateRejectInput } from '../../application/registration/registration-validation'
import { requireParam } from '../../utils/request-params'
import { listMediaForAdmin } from '../../application/media/media-service'

export const adminRegistrationsRouter = Router()

const handleError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.payload)
  }

  console.error('Unexpected admin route error', error)
  return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
}

const parsePagination = (query: Record<string, unknown>) => {
  const pageRaw = typeof query.page === 'string' ? Number(query.page) : 1
  const limitRaw = typeof query.limit === 'string' ? Number(query.limit) : 20

  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1
  const limit =
    Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 20

  return { page, limit }
}

const parseMediaFilters = (query: Record<string, unknown>) => {
  const kindRaw = typeof query.kind === 'string' ? query.kind : undefined
  const statusRaw = typeof query.status === 'string' ? query.status : undefined

  const kind: 'image' | 'video' | undefined =
    kindRaw === 'image' || kindRaw === 'video' ? kindRaw : undefined
  const status: 'ACTIVE' | 'INACTIVE' | undefined =
    statusRaw === 'ACTIVE' || statusRaw === 'INACTIVE' ? statusRaw : undefined

  return { kind, status }
}

adminRegistrationsRouter.get(
  '/users',
  requireAuth,
  async (_req: Request, res: Response) => {
    try {
      const { role } = getAuthContext(res)
      ensureAdminRole(role)

      const response = await listUsersForAdmin()

      return res.status(200).json(response)
    } catch (error) {
      return handleError(res, error)
    }
  }
)

adminRegistrationsRouter.patch(
  '/users/:userId/role',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { role, userId: adminUserId } = getAuthContext(res)
      ensureAdminRole(role)

      const targetUserId = requireParam(req.params.userId)
      const response = await toggleUserRoleByAdmin(targetUserId, adminUserId)

      return res.status(200).json(response)
    } catch (error) {
      return handleError(res, error)
    }
  }
)

adminRegistrationsRouter.delete(
  '/users/:userId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { role, userId: adminUserId } = getAuthContext(res)
      ensureAdminRole(role)

      const targetUserId = requireParam(req.params.userId)
      const response = await deleteUserByAdmin(targetUserId, adminUserId)

      return res.status(200).json(response)
    } catch (error) {
      return handleError(res, error)
    }
  }
)

adminRegistrationsRouter.get(
  '/users/:userId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { role } = getAuthContext(res)
      ensureAdminRole(role)

      const targetUserId = requireParam(req.params.userId)
      const response = await getUserByIdForAdmin(targetUserId)

      return res.status(200).json(response)
    } catch (error) {
      return handleError(res, error)
    }
  }
)

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

adminRegistrationsRouter.get(
  '/media',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { role } = getAuthContext(res)
      ensureAdminRole(role)

      const { page, limit } = parsePagination(
        req.query as Record<string, unknown>
      )
      const filters = parseMediaFilters(req.query as Record<string, unknown>)

      const response = await listMediaForAdmin({
        page,
        limit,
        ...filters,
      })

      return res.status(200).json(response)
    } catch (error) {
      return handleError(res, error)
    }
  }
)
