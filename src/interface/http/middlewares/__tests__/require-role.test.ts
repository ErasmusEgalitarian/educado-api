import jwt from 'jsonwebtoken'
import { requireRole } from '../require-role'
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
  headersSent: boolean
  status: jest.Mock
  json: jest.Mock
}

const createMockRes = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 0,
    body: null,
    locals: {},
    headersSent: false,
    status: jest.fn(),
    json: jest.fn(),
  }
  res.status.mockImplementation((code: number) => {
    res.statusCode = code
    res.headersSent = true
    return res
  })
  res.json.mockReturnValue(res)
  return res
}

const createMockReq = (authorization?: string): Partial<Request> => ({
  headers: authorization !== undefined ? { authorization } : {},
})

describe('requireRole', () => {
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
    mockVerify.mockReset()
  })

  it('should call next when user has an allowed role', () => {
    const middleware = requireRole('STUDENT')
    const req = createMockReq('Bearer valid-token')
    const res = createMockRes()

    mockVerify.mockReturnValue({ sub: 'student-1', role: 'STUDENT' })

    middleware(req as Request, res as unknown as Response, next as NextFunction)

    expect(next).toHaveBeenCalled()
  })

  it('should return 403 when user role is not in allowed roles', () => {
    const middleware = requireRole('STUDENT')
    const req = createMockReq('Bearer valid-token')
    const res = createMockRes()

    mockVerify.mockReturnValue({ sub: 'user-1', role: 'USER' })

    middleware(req as Request, res as unknown as Response, next as NextFunction)

    expect(res.json).toHaveBeenCalledWith({ code: 'FORBIDDEN' })
  })

  it('should return 401 when no token is provided', () => {
    const middleware = requireRole('STUDENT')
    const req = createMockReq()
    const res = createMockRes()

    middleware(req as Request, res as unknown as Response, next as NextFunction)

    expect(res.json).toHaveBeenCalledWith({ code: 'UNAUTHORIZED' })
    expect(next).not.toHaveBeenCalled()
  })

  it('should accept multiple allowed roles', () => {
    const middleware = requireRole('STUDENT', 'USER')
    const req = createMockReq('Bearer valid-token')
    const res = createMockRes()

    mockVerify.mockReturnValue({ sub: 'user-1', role: 'USER' })

    middleware(req as Request, res as unknown as Response, next as NextFunction)

    expect(next).toHaveBeenCalled()
  })

  it('should accept ADMIN role when listed in allowed roles', () => {
    const middleware = requireRole('ADMIN')
    const req = createMockReq('Bearer admin-token')
    const res = createMockRes()

    mockVerify.mockReturnValue({ sub: 'admin-1', role: 'ADMIN' })

    middleware(req as Request, res as unknown as Response, next as NextFunction)

    expect(next).toHaveBeenCalled()
  })
})
