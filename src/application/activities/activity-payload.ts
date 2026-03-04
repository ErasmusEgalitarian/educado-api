import { randomUUID } from 'crypto'
import { ActivityType } from '../../models/activity.model'

type FieldErrors = Record<string, string>

type NewActivityType =
  | 'Aula_video'
  | 'Aula_texto'
  | 'Exercicio_multiple_choices'
  | 'exercicio_verdadeiro_falso'

type ActivityBase = {
  id?: string
  sectionId: string
  order: number
  title: string
  type: NewActivityType
}

type AulaVideoActivity = ActivityBase & {
  type: 'Aula_video'
  video: {
    fileUrl: string
    durationSeconds: number
  }
  finalQuestionEnabled: boolean
  finalQuestion?: {
    question: string
    alternatives: string[]
    correctAlternativeIndex: number
  }
}

type AulaTextoActivity = ActivityBase & {
  type: 'Aula_texto'
  content: {
    text: string
  }
}

type ExercicioMultipleChoicesActivity = ActivityBase & {
  type: 'Exercicio_multiple_choices'
  question: string
  alternatives: string[]
  correctAlternativeIndex: number
  image?: {
    fileUrl: string
  }
}

type ExercicioVerdadeiroFalsoActivity = ActivityBase & {
  type: 'exercicio_verdadeiro_falso'
  question: string
  correctAnswer: 'Verdadeiro' | 'Falso'
  image?: {
    fileUrl: string
  }
}

export type ActivityInput =
  | AulaVideoActivity
  | AulaTextoActivity
  | ExercicioMultipleChoicesActivity
  | ExercicioVerdadeiroFalsoActivity

type PersistedActivityPayload = {
  id: string
  sectionId: string
  order: number
  title: string
  type: ActivityType
  pauseTimestamp: number | null
  textPages: string[] | null
  question: string | null
  imageUrl: string | null
  options: string[] | null
  correctAnswer: number | boolean | null
  icon: string | null
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const isInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value)

const isNewType = (value: unknown): value is NewActivityType =>
  value === 'Aula_video' ||
  value === 'Aula_texto' ||
  value === 'Exercicio_multiple_choices' ||
  value === 'exercicio_verdadeiro_falso'

const validateBase = (
  body: Record<string, unknown>,
  fieldErrors: FieldErrors
): { id: string; sectionId: string; order: number; title: string } => {
  const id = normalizeText(body.id) || randomUUID()
  const sectionId = normalizeText(body.sectionId)
  const title = normalizeText(body.title)
  const order = body.order

  if (!sectionId) fieldErrors.sectionId = 'REQUIRED'
  if (!title) fieldErrors.title = 'REQUIRED'
  if (!isInteger(order) || order < 0) fieldErrors.order = 'INVALID'

  return {
    id,
    sectionId,
    order: isInteger(order) ? order : 0,
    title,
  }
}

const validateAlternatives = (
  alternatives: unknown,
  fieldErrors: FieldErrors,
  path: string
): string[] => {
  if (!Array.isArray(alternatives)) {
    fieldErrors[path] = 'INVALID'
    return []
  }

  const sanitized = alternatives
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (sanitized.length < 2 || sanitized.length > 4) {
    fieldErrors[path] = 'LENGTH_INVALID'
  }

  return sanitized
}

const validateMultipleChoiceIndex = (
  index: unknown,
  alternativesLength: number,
  fieldErrors: FieldErrors,
  path: string
): number => {
  if (!isInteger(index) || index < 0 || index >= alternativesLength) {
    fieldErrors[path] = 'INVALID'
    return 0
  }

  return index
}

const validateAulaVideo = (
  body: Record<string, unknown>,
  base: { id: string; sectionId: string; order: number; title: string },
  fieldErrors: FieldErrors
): PersistedActivityPayload => {
  const video = isObject(body.video) ? body.video : {}
  const fileUrl = normalizeText(video.fileUrl)
  const durationSeconds = video.durationSeconds

  if (!fileUrl) fieldErrors['video.fileUrl'] = 'REQUIRED'
  if (
    !isInteger(durationSeconds) ||
    durationSeconds < 0 ||
    durationSeconds > 180
  ) {
    fieldErrors['video.durationSeconds'] = 'RANGE_INVALID'
  }

  const finalQuestionEnabled = body.finalQuestionEnabled === true

  let question: string | null = null
  let options: string[] | null = null
  let correctAnswer: number | null = null

  if (finalQuestionEnabled) {
    const finalQuestion = isObject(body.finalQuestion)
      ? body.finalQuestion
      : null

    if (!finalQuestion) {
      fieldErrors.finalQuestion = 'REQUIRED'
    } else {
      const fqQuestion = normalizeText(finalQuestion.question)
      if (!fqQuestion) fieldErrors['finalQuestion.question'] = 'REQUIRED'
      const alternatives = validateAlternatives(
        finalQuestion.alternatives,
        fieldErrors,
        'finalQuestion.alternatives'
      )
      const index = validateMultipleChoiceIndex(
        finalQuestion.correctAlternativeIndex,
        alternatives.length,
        fieldErrors,
        'finalQuestion.correctAlternativeIndex'
      )

      question = fqQuestion
      options = alternatives
      correctAnswer = index
    }
  }

  return {
    ...base,
    type: 'video_pause',
    pauseTimestamp: isInteger(durationSeconds) ? durationSeconds : null,
    textPages: null,
    question,
    imageUrl: fileUrl || null,
    options,
    correctAnswer,
    icon: null,
  }
}

const validateAulaTexto = (
  body: Record<string, unknown>,
  base: { id: string; sectionId: string; order: number; title: string },
  fieldErrors: FieldErrors
): PersistedActivityPayload => {
  const content = isObject(body.content) ? body.content : {}
  const text = normalizeText(content.text)

  if (!text) fieldErrors['content.text'] = 'REQUIRED'

  return {
    ...base,
    type: 'text_reading',
    pauseTimestamp: null,
    textPages: text ? [text] : null,
    question: null,
    imageUrl: null,
    options: null,
    correctAnswer: null,
    icon: null,
  }
}

const validateExercicioMultipleChoices = (
  body: Record<string, unknown>,
  base: { id: string; sectionId: string; order: number; title: string },
  fieldErrors: FieldErrors
): PersistedActivityPayload => {
  const question = normalizeText(body.question)
  if (!question) fieldErrors.question = 'REQUIRED'

  const alternatives = validateAlternatives(
    body.alternatives,
    fieldErrors,
    'alternatives'
  )

  const correctAlternativeIndex = validateMultipleChoiceIndex(
    body.correctAlternativeIndex,
    alternatives.length,
    fieldErrors,
    'correctAlternativeIndex'
  )

  const image = isObject(body.image) ? body.image : null
  const imageUrl = image ? normalizeText(image.fileUrl) : ''

  return {
    ...base,
    type: 'multiple_choice',
    pauseTimestamp: null,
    textPages: null,
    question,
    imageUrl: imageUrl || null,
    options: alternatives,
    correctAnswer: correctAlternativeIndex,
    icon: null,
  }
}

const validateExercicioVerdadeiroFalso = (
  body: Record<string, unknown>,
  base: { id: string; sectionId: string; order: number; title: string },
  fieldErrors: FieldErrors
): PersistedActivityPayload => {
  const question = normalizeText(body.question)
  if (!question) fieldErrors.question = 'REQUIRED'

  const correctAnswer = body.correctAnswer
  if (correctAnswer !== 'Verdadeiro' && correctAnswer !== 'Falso') {
    fieldErrors.correctAnswer = 'INVALID'
  }

  const image = isObject(body.image) ? body.image : null
  const imageUrl = image ? normalizeText(image.fileUrl) : ''

  return {
    ...base,
    type: 'true_false',
    pauseTimestamp: null,
    textPages: null,
    question,
    imageUrl: imageUrl || null,
    options: null,
    correctAnswer: correctAnswer === 'Verdadeiro',
    icon: null,
  }
}

export const validateAndMapActivityPayload = (
  payload: unknown
): { data: PersistedActivityPayload | null; fieldErrors: FieldErrors } => {
  const body = isObject(payload) ? payload : {}
  const fieldErrors: FieldErrors = {}

  const type = body.type

  if (!isNewType(type)) {
    fieldErrors.type = 'INVALID'
    return { data: null, fieldErrors }
  }

  const base = validateBase(body, fieldErrors)

  const mapped =
    type === 'Aula_video'
      ? validateAulaVideo(body, base, fieldErrors)
      : type === 'Aula_texto'
        ? validateAulaTexto(body, base, fieldErrors)
        : type === 'Exercicio_multiple_choices'
          ? validateExercicioMultipleChoices(body, base, fieldErrors)
          : validateExercicioVerdadeiroFalso(body, base, fieldErrors)

  if (Object.keys(fieldErrors).length > 0) {
    return { data: null, fieldErrors }
  }

  return { data: mapped, fieldErrors }
}
