import { Response, Router } from 'express'
import { myCoursesList } from '../courses/courses-get'
import { requireAuth } from '../../interface/http/middlewares/auth-jwt'
import { AppError } from '../../application/common/app-error'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'
import { listMediaByOwner } from '../../application/media/media-service'

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

const handleError = (res: Response, error: unknown) => {
	if (error instanceof AppError) {
		return res.status(error.statusCode).json(error.payload)
	}

	console.error('Unexpected me route error', error)
	return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
}

export const meRouter = Router()

meRouter.use(requireAuth)

// GET /me/courses - List courses owned by the authenticated user
meRouter.get('/courses', myCoursesList)

// GET /me/media - List media owned by authenticated user
meRouter.get('/media', async (req, res) => {
	try {
		const { userId } = getAuthContext(res)
		const { page, limit } = parsePagination(req.query as Record<string, unknown>)
		const filters = parseMediaFilters(req.query as Record<string, unknown>)

		const media = await listMediaByOwner(userId, {
			page,
			limit,
			...filters,
		})

		return res.status(200).json(media)
	} catch (error) {
		return handleError(res, error)
	}
})
