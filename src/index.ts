import cors from 'cors'
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
import { requestIdMiddleware } from './interface/http/middlewares/request-id'
import { requireHttpsInProduction } from './interface/http/middlewares/require-https'

export const isProd = () => process.env.NODE_ENV === 'production'

// Initialize dotenv
config()

// Initialize express
const app = express()

// Set the port
const port = process.env.PORT || 5000

// Initialize middleware
const frontendOrigin = process.env.FRONTEND_ORIGIN
app.use(
  cors({
    origin: frontendOrigin
      ? [frontendOrigin]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  })
)
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

initializeDatabase()

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
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})

// Export sequelize instance
export { sequelize }
