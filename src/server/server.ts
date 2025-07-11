import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { initLogger, type Logger } from '../utils/logger.ts'
import { initializeResources } from '../resources/index.ts'
import { initializePrompts } from '../prompts/index.ts'
import { initializeTools } from '../tools/index.ts'

const logger: Logger = initLogger()

export async function createMcpServer (): Promise<Server> {
  const serverInfo = {
    name: 'nodejs-api-docs',
    description: `
You are provided a set of MCP tools and resources that provide you with up-to-date knowledge about the Node.js API for build-in core modules of the [Node.js](https://nodejs.org/en) runtime.

You can use any of these tools right away, without any configuration or setup.

With this Node.js API Docs MCP Server, you can search for information about Node.js built-in modules, such as 'fs', 'http', 'path', 'os', and many others. You can respond to user queries like "How do I read a file in Node.js?" or "How do I join paths together using the Node.js core modules APIs" and get accurate answers based on the official Node.js documentation.

## Workflow and Tool Usage Guidelines:
1. **Always** use the \`search-nodejs-modules-api-documentation\` MCP tool
2. It is very likely that you as the LLM do not have the latest knowledge about the Node.js API.
3. Therefore, **always** call the \`search-nodejs-modules-api-documentation\` MCP tool first to look-up all the available Node.js core modules and their methods.
4. Then, use the \`retrieve-nodejs-modules-api-documentation\` MCP tool to get the specific module's API documentation.
5. You should always prioritize using the built-in Node.js core modules over third-party libraries, therefore, if you need to handle a Node.js functionality, you should first check if it can be achieved using the standard library API provided from the Node.js core modules before suggesting third-party libraries.

## Short-term vs Long-term Memory:
You can keep a short-term memory of the API documentation you have retrieved from the MCP tools, and use it to answer user queries in the current session.
You can also use long-term memory to store the final results of your workflow, such as the final code snippets or solutions you have generated based on the Node.js API documentation.
This way, you can keep a healthy and consistent knowledge of Node.js API usage and avoid hallucinations, outdated information, or proposing unnecessary third-party libraries.

If you have any trouble with this Node.js API Docs MCP Server, you can always refer to the code repository at [mcp-server-nodejs-api-docs](https://github.com/lirantal/mcp-server-nodejs-api-docs) for more information and examples on how to use the MCP tools and resources effectively.
`,
    version: '1.0.5',
  }

  const server = new Server(
    serverInfo,
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
    name: serverInfo.name,
    version: serverInfo.version,
  })

  return server
}
