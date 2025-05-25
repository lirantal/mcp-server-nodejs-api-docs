import { createMcpServer } from './server/server.ts'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { initLogger } from './utils/logger.ts'
import { setupProcessErrorHandlers } from './utils/error-handlers.ts'

const logger = initLogger()

export async function startServer () {
  let server
  try {
    server = await createMcpServer()
  } catch (error) {
    logger.error({ err: error, msg: 'Failed to create MCP server' })
    console.error('Fatal error during server creation.')
    process.exit(1)
  }

  // Setup error handlers
  setupProcessErrorHandlers(logger)

  try {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    logger.info({ msg: 'Server connected to transport. Ready.' })
  } catch (error) {
    logger.error({ err: error, msg: 'Failed to initialize server' })
    console.error('Fatal error during server transport init.')
    process.exit(1)
  }
}