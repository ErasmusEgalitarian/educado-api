import { Sequelize } from 'sequelize'
import { config } from 'dotenv'

// Load environment variables
config()

const isProd = () => process.env.NODE_ENV === 'production'

const postgresUri = isProd()
  ? process.env.POSTGRES_URI
  : process.env.POSTGRES_URI_DEV

// Create Sequelize instance
export const sequelize = new Sequelize(postgresUri ?? '', {
  dialect: 'postgres',
  database: isProd() ? 'educado' : 'educado_dev',
  logging: false,
})

// Test database connection
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL database connection established successfully')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    throw error
  }
}

// Sync database (create tables if they don't exist)
export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force })
    console.log('Database synchronized successfully')
  } catch (error) {
    console.error('Error synchronizing database:', error)
    throw error
  }
}
