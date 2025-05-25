import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { initLogger } from '../utils/logger.ts'
import { initializeResources } from '../resources/index.ts'
import { initializePrompts } from '../prompts/index.ts'
import { initializeTools } from '../tools/index.ts'

const logger = initLogger()

export async function createMcpServer () {
  const server = new Server(
    {
      name: 'nodejs-module-api-documentation',
      description:
        'Search built-in core Node.js modules API Documentation. Use whenever the user asks questions about Node.js API, Node.js modules or Node.js functions.',
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {},
      },
    }
  )

  await initializePrompts(server)
  await initializeResources(server)
  await initializeTools(server)

  logger.info({
    msg: 'MCP Server instance created',
    name: server.name,
    version: server.version,
  })

  return server
}
