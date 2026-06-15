/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import bridgeRoutes from './routes/bridges'
import inspectionRoutes from './routes/inspections'
import diseaseRoutes from './routes/diseases'
import maintenanceRoutes from './routes/maintenances'
import patrolRoutes from './routes/patrols'
import dashboardRoutes from './routes/dashboard'
import inspectionPlanRoutes from './routes/inspectionPlans'
import disposalTaskRoutes from './routes/disposalTasks'
import { loadAllData } from './data'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

loadAllData()

/**
 * API Routes
 */
app.use('/api/bridges', bridgeRoutes)
app.use('/api/inspections', inspectionRoutes)
app.use('/api/diseases', diseaseRoutes)
app.use('/api/maintenances', maintenanceRoutes)
app.use('/api/patrols', patrolRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/inspection-plans', inspectionPlanRoutes)
app.use('/api/disposal-tasks', disposalTaskRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
