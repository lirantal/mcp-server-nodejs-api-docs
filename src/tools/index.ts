import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { createSearchTool, createModulesTool } from './tools-factory.ts'

export async function initializeTools (server: Server): Promise<void> {
  // Create the search tool
  const searchTool = await createSearchTool()

  // Refactor to avoid the `createModuleTools` that created a single tool for each
  // module which resulted in potentially too many tools being registered (about 50)
  // and instead create a single tool that can handle all modules by using a sort of
  // look up method
  // const moduleTools = await createModuleTools()
  const modulesTool = await createModulesTool()

  // Combine all tools
  const tools = {
    [searchTool.name]: searchTool,
    ...modulesTool
  }

  // Create tool list for MCP
  const toolsList = Object.keys(tools).map((toolName) => ({
    name: toolName,
    // eslint-disable-next-line security/detect-object-injection
    description: tools[toolName].description,
    // eslint-disable-next-line security/detect-object-injection
    inputSchema: tools[toolName].inputSchema,
  }))

  // Set up MCP request handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolsList,
    }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (!Object.hasOwn(tools, request.params.name)) {
      throw new Error(`Tool ${request.params.name} not found`)
    }
    const tool = tools[request.params.name]

    return await tool.handler(request.params.arguments || {})
  })
}
