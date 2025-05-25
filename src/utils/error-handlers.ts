import process from 'node:process'
import type { Logger } from '../utils/logger.js'

export function setupProcessErrorHandlers (logger: Logger): void {
  process.on('SIGINT', () => {
    logger.info({ msg: 'Received SIGINT. Shutting down...' })
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    logger.info({ msg: 'Received SIGTERM. Shutting down...' })
    process.exit(0)
  })

  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error, msg: 'Uncaught Exception' })
    logger.flush()
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise, msg: 'Unhandled Rejection' })
    logger.flush()
    process.exit(1)
  })
}
