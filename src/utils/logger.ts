import { pino } from 'pino'
import type { Logger } from 'pino'

// Re-export pino types for use in other modules
export type { Logger } from 'pino'

const logFilePath = '/tmp/mcp-server-nodejs-docs.log'

export function initLogger (): Logger {
  const logLevel = process.argv.includes('--debug') ? 'debug' : 'info'

  const logger = pino(
    { level: logLevel },
    pino.destination(logFilePath)
  )

  logger.info({
    msg: `Logger initialized with level: ${logLevel}. Logging to: ${logFilePath}`
  })

  return logger
}
