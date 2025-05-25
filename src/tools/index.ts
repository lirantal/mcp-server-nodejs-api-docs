import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { createSearchTool, createModuleTools } from './tools-factory.ts'

export async function initializeTools (server) {
  // Create the search tool
  const searchTool = await createSearchTool()

  // Create individual module tools
  const moduleTools = await createModuleTools()

  // Combine all tools
  const tools = {
    [searchTool.name]: searchTool,
    ...moduleTools
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

    return await tool.handler(request.params.arguments)
  })
}
