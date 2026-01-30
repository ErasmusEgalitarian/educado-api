import cors from 'cors'
import express from 'express'

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

export const isProd = () => process.env.NODE_ENV === 'production'

// Initialize dotenv
config()

// Initialize express
const app = express()

// Set the port
const port = process.env.PORT || 5000

// Initialize middleware
app.use(cors())
app.use(express.urlencoded({ extended: true, limit: 10000 }))
app.enable('trust proxy')

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})

// Export sequelize instance
export { sequelize }
