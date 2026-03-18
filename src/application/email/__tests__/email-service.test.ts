const mockAdd = jest.fn().mockResolvedValue(undefined)

jest.mock('../../../infrastructure/queue/email-queue', () => ({
  emailQueue: {
    add: mockAdd,
  },
  EMAIL_JOB_NAME: 'send-email',
}))

import { EmailService } from '../email-service'

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should enqueue email with correct job name and options', async () => {
    const service = new EmailService()

    await service.sendEmail({
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    })

    expect(mockAdd).toHaveBeenCalledWith(
      'send-email',
      {
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
      },
      expect.objectContaining({
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 1000,
        removeOnFail: 1000,
      })
    )
  })

  it('should propagate errors from queue.add', async () => {
    mockAdd.mockRejectedValueOnce(new Error('Queue error'))
    const service = new EmailService()

    await expect(
      service.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })
    ).rejects.toThrow('Queue error')
  })
})
