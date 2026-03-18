import { requireHttpsInProduction } from '../require-https'
import { Request, Response, NextFunction } from 'express'

describe('requireHttpsInProduction', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  const createMocks = (opts: { secure?: boolean; forwardedProto?: string } = {}) => {
    const req = {
      secure: opts.secure ?? false,
      header: jest.fn((name: string) => {
        if (name === 'x-forwarded-proto') return opts.forwardedProto
        return undefined
      }),
    } as unknown as Request

    const jsonFn = jest.fn()
    const res = {
      status: jest.fn(() => ({ json: jsonFn })),
    } as unknown as Response & { status: jest.Mock }

    const next: NextFunction = jest.fn()

    return { req, res, next, jsonFn }
  }

  it('should call next() in non-production environment', () => {
    process.env.NODE_ENV = 'development'
    const { req, res, next } = createMocks()
    requireHttpsInProduction(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('should call next() in test environment', () => {
    process.env.NODE_ENV = 'test'
    const { req, res, next } = createMocks()
    requireHttpsInProduction(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('should call next() when req.secure is true in production', () => {
    process.env.NODE_ENV = 'production'
    const { req, res, next } = createMocks({ secure: true })
    requireHttpsInProduction(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('should call next() when x-forwarded-proto is https in production', () => {
    process.env.NODE_ENV = 'production'
    const { req, res, next } = createMocks({ forwardedProto: 'https' })
    requireHttpsInProduction(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it('should return 403 when not https in production', () => {
    process.env.NODE_ENV = 'production'
    const { req, res, next, jsonFn } = createMocks({ forwardedProto: 'http' })
    requireHttpsInProduction(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(jsonFn).toHaveBeenCalledWith({ code: 'HTTPS_REQUIRED' })
  })

  it('should return 403 when no https indicators in production', () => {
    process.env.NODE_ENV = 'production'
    const { req, res, next, jsonFn } = createMocks()
    requireHttpsInProduction(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(jsonFn).toHaveBeenCalledWith({ code: 'HTTPS_REQUIRED' })
  })
})
