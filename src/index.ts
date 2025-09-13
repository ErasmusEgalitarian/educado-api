import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import { config } from 'dotenv'
import { userRouter } from './routes/user/user'

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

// Initialize MongoDB
const uri = process.env.MONGODB_PATH ?? ''
mongoose.connect(uri, { dbName: process.env.MONGODB_DBNAME ?? '' })
mongoose.set('strictQuery', true)

const connection = mongoose.connection

connection.once('open', () => {
  console.log('MongoDB database connection established sauccessfully')
})

// Initialize routes
app.use(express.json())
app.use('/user', userRouter)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
