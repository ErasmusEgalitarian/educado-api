import { config } from 'dotenv'
import { startEmailWorker } from '../infrastructure/queue/email-worker'

config()

startEmailWorker()

console.log('Email worker running')
