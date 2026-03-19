import jwt from 'jsonwebtoken'
import { requireAuth, getAuthContext } from '../auth-jwt'
import type { Request, Response, NextFunction } from 'express'

jest.mock('jsonwebtoken')
jest.mock('../../../../config/jwt', () => ({
  getAccessTokenSecret: jest.fn(() => 'test-secret'),
}))

const mockVerify = jwt.verify as jest.Mock

type MockResponse = Partial<Response> & {
  statusCode: number
  body: unknown
  locals: Record<string, unknown>
  status: jest.Mock
  json: jest.Mock
}

const createMockRes = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 0,
    body: null,
    locals: {},
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  return res
}

const createMockReq = (authorization?: string): Partial<Request> => ({
  headers: authorization !== undefined ? { authorization } : {},
})

describe('requireAuth', () => {
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
    mockVerify.mockReset()
  })

  it('should return 401 when no authorization header is present', () => {
    const req = createMockReq()
    const res = createMockRes()

    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ code: 'UNAUTHORIZED' })
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 when authorization header does not start with Bearer', () => {
    const req = createMockReq('Basic some-token')
    const res = createMockRes()

    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 when token is empty after Bearer', () => {
    const req = createMockReq('Bearer ')
    const res = createMockRes()

    // Empty string token - jwt.verify won't be called since token is falsy
    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    // The middleware slices "Bearer " to get "", which is falsy
    // so it returns 401 before calling jwt.verify
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should call next and set auth context for a valid token', () => {
    const req = createMockReq('Bearer valid-token')
    const res = createMockRes()

    mockVerify.mockReturnValue({ sub: 'user-123', role: 'USER' })

    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    expect(next).toHaveBeenCalled()
    expect(res.locals.auth).toEqual({
      userId: 'user-123',
      role: 'USER',
    })
  })

  it('should set role to ADMIN when token has ADMIN role', () => {
    const req = createMockReq('Bearer admin-token')
    const res = createMockRes()

    mockVerify.mockReturnValue({ sub: 'admin-1', role: 'ADMIN' })

    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    expect(next).toHaveBeenCalled()
    expect(res.locals.auth).toEqual({
      userId: 'admin-1',
      role: 'ADMIN',
    })
  })

  it('should default role to USER when token role is not ADMIN', () => {
    const req = createMockReq('Bearer some-token')
    const res = createMockRes()

    mockVerify.mockReturnValue({ sub: 'user-1', role: 'MODERATOR' })

    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    expect(next).toHaveBeenCalled()
    expect(res.locals.auth).toEqual({
      userId: 'user-1',
      role: 'USER',
    })
  })

  it('should return 401 when jwt.verify throws (invalid/expired token)', () => {
    const req = createMockReq('Bearer expired-token')
    const res = createMockRes()

    mockVerify.mockImplementation(() => {
      throw new Error('jwt expired')
    })

    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ code: 'UNAUTHORIZED' })
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 when token has no sub claim', () => {
    const req = createMockReq('Bearer no-sub-token')
    const res = createMockRes()

    mockVerify.mockReturnValue({ role: 'USER' })

    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 when sub is not a string', () => {
    const req = createMockReq('Bearer bad-sub-token')
    const res = createMockRes()

    mockVerify.mockReturnValue({ sub: 123, role: 'USER' })

    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 500 when getAccessTokenSecret throws', () => {
    const req = createMockReq('Bearer valid-token')
    const res = createMockRes()

    // Re-mock the config to throw
    const { getAccessTokenSecret } = require('../../../../config/jwt')
    getAccessTokenSecret.mockImplementationOnce(() => {
      throw new Error('no secret')
    })

    requireAuth(
      req as Request,
      res as unknown as Response,
      next as NextFunction
    )

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      code: 'MISSING_ACCESS_TOKEN_SECRET',
    })
    expect(next).not.toHaveBeenCalled()
  })
})

describe('getAuthContext', () => {
  it('should return the auth context from res.locals', () => {
    const res = {
      locals: {
        auth: { userId: 'user-1', role: 'USER' as const },
      },
    } as unknown as Response

    const context = getAuthContext(res)
    expect(context).toEqual({ userId: 'user-1', role: 'USER' })
  })

  it('should return the auth context for ADMIN role', () => {
    const res = {
      locals: {
        auth: { userId: 'admin-1', role: 'ADMIN' as const },
      },
    } as unknown as Response

    const context = getAuthContext(res)
    expect(context).toEqual({ userId: 'admin-1', role: 'ADMIN' })
  })
})
