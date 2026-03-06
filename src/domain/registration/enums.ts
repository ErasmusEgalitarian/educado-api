export const REGISTRATION_STATUSES = [
  'DRAFT_PROFILE',
  'PENDING_REVIEW',
  'PENDING_EMAIL_VERIFICATION',
  'APPROVED',
  'REJECTED',
] as const

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

export const USER_ROLES = ['USER', 'ADMIN'] as const

export type UserRole = (typeof USER_ROLES)[number]

export const REVIEW_DECISIONS = ['APPROVE', 'REJECT'] as const

export type ReviewDecision = (typeof REVIEW_DECISIONS)[number]
