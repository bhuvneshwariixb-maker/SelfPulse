import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import dotenv from 'dotenv'

import { logger } from './services/logger.js'
import { initializeDatabase } from './db/init.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import emergencyRoutes from './routes/emergency.js'
import journeyRoutes from './routes/journey.js'
import routeRoutes from './routes/routes.js'
import safetyMapRoutes from './routes/safetyMap.js'
import trustedContactRoutes from './routes/trustedContacts.js'
import protectorRoutes from './routes/protectors.js'
import communityReportRoutes from './routes/communityReports.js'
import notificationRoutes from './routes/notifications.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '3000')

// Security middleware
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))

// Logging middleware
app.use(pinoHttp({ logger }))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/journey', journeyRoutes)
app.use('/api/routes', routeRoutes)
app.use('/api/safety-map', safetyMapRoutes)
app.use('/api/trusted-contacts', trustedContactRoutes)
app.use('/api/protectors', protectorRoutes)
app.use('/api/community-reports', communityReportRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use(errorHandler)

// Initialize database and start server
async function main() {
  try {
    logger.info('Initializing database...')
    await initializeDatabase()
    logger.info('Database initialized successfully')

    app.listen(PORT, () => {
      logger.info(`SelfPulse backend running on port ${PORT}`)
    })
  } catch (error) {
    logger.error(error, 'Failed to start server')
    process.exit(1)
  }
}

main()
