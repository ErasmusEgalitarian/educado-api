import { Request, Response } from 'express'
import { Op, WhereOptions } from 'sequelize'
import { AppError } from '../../application/common/app-error'
import {
  InstitutionInput,
  InstitutionUpdateInput,
  validateInstitutionPayload,
} from '../../application/institutions/institution-validation'
import { Institution } from '../../models/institution.model'
import { ensureAdminRole } from '../../application/registration/registration-service'
import { getAuthContext } from '../../interface/http/middlewares/auth-jwt'

const normalizeDomainInput = (value?: string) => {
  if (!value) return value
  return value.trim().replace(/^@+/, '').toLowerCase()
}

const handleError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(error.payload)
  }

  console.error('Unexpected institutions route error', error)
  return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' })
}

const ensureUniqueInstitutionData = async (
  payload: {
    name?: string
    domain?: string
    secondaryDomain?: string
  },
  ignoreId?: string
) => {
  const whereOr: WhereOptions<Institution>[] = []

  if (payload.name) {
    whereOr.push({ name: payload.name })
  }

  const domains = [payload.domain, payload.secondaryDomain].filter(
    Boolean
  ) as string[]

  domains.forEach((domainCandidate) => {
    whereOr.push({ domain: domainCandidate })
    whereOr.push({ secondaryDomain: domainCandidate })
  })

  if (whereOr.length === 0) {
    return
  }

  const where = ignoreId
    ? {
        [Op.and]: [{ [Op.or]: whereOr }, { id: { [Op.ne]: ignoreId } }],
      }
    : {
        [Op.or]: whereOr,
      }

  const existing = await Institution.findOne({ where })

  if (!existing) {
    return
  }

  const fieldErrors: Record<string, string> = {}

  if (payload.name && existing.name === payload.name) {
    fieldErrors.name = 'ALREADY_EXISTS'
  }

  if (
    payload.domain &&
    (existing.domain === payload.domain ||
      existing.secondaryDomain === payload.domain)
  ) {
    fieldErrors.domain = 'ALREADY_EXISTS'
  }

  if (
    payload.secondaryDomain &&
    (existing.domain === payload.secondaryDomain ||
      existing.secondaryDomain === payload.secondaryDomain)
  ) {
    fieldErrors.secondaryDomain = 'ALREADY_EXISTS'
  }

  throw new AppError(422, {
    code: 'VALIDATION_ERROR',
    fieldErrors,
  })
}

export const institutionsList = async (_req: Request, res: Response) => {
  try {
    const { role } = getAuthContext(res)
    ensureAdminRole(role)

    const institutions = await Institution.findAll({
      order: [['name', 'ASC']],
    })

    return res.status(200).json(institutions)
  } catch (error) {
    return handleError(res, error)
  }
}

export const institutionsGetById = async (req: Request, res: Response) => {
  try {
    const { role } = getAuthContext(res)
    ensureAdminRole(role)

    const id = typeof req.params.id === 'string' ? req.params.id : ''

    const institution = await Institution.findByPk(id)

    if (!institution) {
      throw new AppError(404, { code: 'INSTITUTION_NOT_FOUND' })
    }

    return res.status(200).json(institution)
  } catch (error) {
    return handleError(res, error)
  }
}

export const institutionsCreate = async (req: Request, res: Response) => {
  try {
    const { role } = getAuthContext(res)
    ensureAdminRole(role)

    const validation = validateInstitutionPayload(req.body)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const payload = validation.data as InstitutionInput
    const normalizedDomain = normalizeDomainInput(payload.domain) ?? ''
    const normalizedSecondaryDomain =
      normalizeDomainInput(payload.secondaryDomain) ?? undefined

    await ensureUniqueInstitutionData({
      ...payload,
      domain: normalizedDomain,
      secondaryDomain: normalizedSecondaryDomain,
    })

    const institution = await Institution.create({
      name: payload.name,
      domain: normalizedDomain,
      secondaryDomain: normalizedSecondaryDomain ?? null,
      isActive: payload.isActive ?? true,
    })

    return res.status(201).json(institution)
  } catch (error) {
    return handleError(res, error)
  }
}

export const institutionsUpdate = async (req: Request, res: Response) => {
  try {
    const { role } = getAuthContext(res)
    ensureAdminRole(role)

    const id = typeof req.params.id === 'string' ? req.params.id : ''

    const institution = await Institution.findByPk(id)

    if (!institution) {
      throw new AppError(404, { code: 'INSTITUTION_NOT_FOUND' })
    }

    const validation = validateInstitutionPayload(req.body, true)

    if (!validation.data) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: validation.fieldErrors,
      })
    }

    const payload = validation.data as InstitutionUpdateInput

    const nextName =
      payload.name !== undefined ? payload.name : institution.name
    const nextDomain =
      payload.domain !== undefined
        ? payload.domain
        : institution.domain
    const nextSecondaryDomain =
      payload.secondaryDomain !== undefined
        ? payload.secondaryDomain
        : (institution.secondaryDomain ?? undefined)
    const normalizedNextDomain = normalizeDomainInput(nextDomain) ?? ''
    const normalizedNextSecondaryDomain =
      normalizeDomainInput(nextSecondaryDomain) ?? undefined

    if (normalizedNextDomain === normalizedNextSecondaryDomain) {
      return res.status(422).json({
        code: 'VALIDATION_ERROR',
        fieldErrors: {
          secondaryDomain: 'MUST_DIFFER_FROM_DOMAIN',
        },
      })
    }

    await ensureUniqueInstitutionData(
      {
        name: nextName,
        domain: normalizedNextDomain,
        secondaryDomain: normalizedNextSecondaryDomain,
      },
      institution.id
    )

    await institution.update({
      name: nextName,
      domain: normalizedNextDomain,
      secondaryDomain: normalizedNextSecondaryDomain ?? null,
      isActive:
        payload.isActive !== undefined
          ? payload.isActive
          : institution.isActive,
    })

    return res.status(200).json(institution)
  } catch (error) {
    return handleError(res, error)
  }
}

export const institutionsDelete = async (req: Request, res: Response) => {
  try {
    const { role } = getAuthContext(res)
    ensureAdminRole(role)

    const id = typeof req.params.id === 'string' ? req.params.id : ''

    const institution = await Institution.findByPk(id)

    if (!institution) {
      throw new AppError(404, { code: 'INSTITUTION_NOT_FOUND' })
    }

    await institution.destroy()

    return res.status(204).send()
  } catch (error) {
    return handleError(res, error)
  }
}
