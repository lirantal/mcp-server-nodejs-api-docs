import pino from 'pino'

const logFilePath = '/tmp/mcp-server-nodejs-docs.log'

export function initLogger () {
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
