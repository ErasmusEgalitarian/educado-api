import { requestIdMiddleware } from '../request-id'
import { Request, Response, NextFunction } from 'express'

describe('requestIdMiddleware', () => {
  const createMocks = (incomingRequestId?: string) => {
    const req = {
      header: jest.fn((name: string) => {
        if (name === 'x-request-id') return incomingRequestId
        return undefined
      }),
      method: 'GET',
      originalUrl: '/test',
    } as unknown as Request

    const res = {
      setHeader: jest.fn(),
      locals: {} as Record<string, unknown>,
      on: jest.fn(),
      statusCode: 200,
    } as unknown as Response

    const next: NextFunction = jest.fn()

    return { req, res, next }
  }

  it('should set requestId on res.locals', () => {
    const { req, res, next } = createMocks()
    requestIdMiddleware(req, res, next)
    expect(res.locals.requestId).toBeDefined()
    expect(typeof res.locals.requestId).toBe('string')
  })

  it('should call next()', () => {
    const { req, res, next } = createMocks()
    requestIdMiddleware(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should set x-request-id header on response', () => {
    const { req, res, next } = createMocks()
    requestIdMiddleware(req, res, next)
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', expect.any(String))
  })

  it('should use incoming x-request-id if provided', () => {
    const { req, res, next } = createMocks('incoming-id-123')
    requestIdMiddleware(req, res, next)
    expect(res.locals.requestId).toBe('incoming-id-123')
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'incoming-id-123')
  })

  it('should generate a UUID when no x-request-id header is present', () => {
    const { req, res, next } = createMocks(undefined)
    requestIdMiddleware(req, res, next)
    expect(res.locals.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })

  it('should generate a UUID when x-request-id header is empty string', () => {
    const { req, res, next } = createMocks('')
    requestIdMiddleware(req, res, next)
    expect(res.locals.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })

  it('should generate a UUID when x-request-id is whitespace only', () => {
    const { req, res, next } = createMocks('   ')
    requestIdMiddleware(req, res, next)
    expect(res.locals.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })

  it('should register a finish event listener on res', () => {
    const { req, res, next } = createMocks()
    requestIdMiddleware(req, res, next)
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function))
  })

  it('should log request info with duration when finish event fires', () => {
    const { req, res, next } = createMocks()
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()

    requestIdMiddleware(req, res, next)

    const finishCallback = (res.on as jest.Mock).mock.calls.find(
      (call: unknown[]) => call[0] === 'finish'
    )[1]
    finishCallback()

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0])
    expect(loggedData).toMatchObject({
      method: 'GET',
      path: '/test',
      statusCode: 200,
    })
    expect(loggedData.requestId).toBeDefined()
    expect(typeof loggedData.durationMs).toBe('number')

    consoleInfoSpy.mockRestore()
  })
})
