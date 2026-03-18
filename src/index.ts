import cors, { CorsOptions } from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

import { config } from 'dotenv'
import {
  sequelize,
  syncDatabase,
  testDatabaseConnection,
} from './config/database'
import { userRouter } from './routes/user/user'
import { coursesRouter } from './routes/courses/courses'
import { sectionsRouter } from './routes/sections/sections'
import { activitiesRouter } from './routes/activities/activities'
import { progressRouter } from './routes/progress/progress'
import { certificatesRouter } from './routes/certificates/certificates'
import { swaggerDocument } from './docs/swagger'
import { authRouter } from './routes/auth/auth'
import { adminRegistrationsRouter } from './routes/admin/registrations'
import { meRouter } from './routes/me/me'
import { tagsRouter } from './routes/tags/tags'
import { institutionsRouter } from './routes/institutions/institutions'
import { requestIdMiddleware } from './interface/http/middlewares/request-id'
import { requireHttpsInProduction } from './interface/http/middlewares/require-https'
import mediaRoutes from './routes/media'
import { emailVerificationRouter } from './routes/verification/email-verification'

export const isProd = () => process.env.NODE_ENV === 'production'

// Initialize dotenv
config()

// Initialize express
const app = express()

// Set the port
const port = process.env.PORT || 5000

// Initialize middleware
const frontendOrigin = process.env.FRONTEND_ORIGIN
const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
const allowedOrigins = frontendOrigin
  ? frontendOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin !== '')
  : defaultOrigins

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Em desenvolvimento, libera CORS para acelerar integração local.
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true)
      return
    }

    if (!origin) {
      callback(null, true)
      return
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`CORS origin not allowed: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(express.urlencoded({ extended: true, limit: 10000 }))
app.enable('trust proxy')
app.use(requestIdMiddleware)
app.use(requireHttpsInProduction)

// Initialize PostgreSQL with Sequelize
const initializeDatabase = async () => {
  try {
    await testDatabaseConnection()

    // Sync database (only use force in development with caution)
    // FORCE WILL NUKE DATABASE
    await syncDatabase(false)
  } catch (error) {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  }
}

const startServer = async () => {
  await initializeDatabase()
  // Initialize routes
  app.use(express.json())
  app.use('/user', userRouter)
  app.use('/courses', coursesRouter)
  app.use('/sections', sectionsRouter)
  app.use('/activities', activitiesRouter)
  app.use('/progress', progressRouter)
  app.use('/certificates', certificatesRouter)
  app.use('/auth', authRouter)
  app.use('/admin', adminRegistrationsRouter)
  app.use('/me', meRouter)
  app.use('/tags', tagsRouter)
  app.use('/institutions', institutionsRouter)
  app.use('/account/email-verification', emailVerificationRouter)
  app.use('/media', mediaRoutes)
  app.get('/docs', (_req, res) => {
    res.redirect('/docs/')
  })
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
  })
}

void startServer()

// Export sequelize instance
export { sequelize }
