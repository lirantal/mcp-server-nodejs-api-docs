import { initLogger, type Logger } from '../utils/logger.ts'
import { ApiDocsService } from '../services/api-docs-service.ts'

const logger: Logger = initLogger()
const apiDocsService = new ApiDocsService()

interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
  handler: (params: Record<string, any>) => Promise<{ content: { type: string; text: string }[] }>
}

interface ToolsDictionary {
  [key: string]: ToolDefinition
}

export async function createSearchTool (): Promise<ToolDefinition> {
  const { modules } = await apiDocsService.getApiDocsModules()

  const toolName = 'search-nodejs-modules-api-documentation'

  return {
    name: toolName,
    description: `
      <use_case>
        Use this tool to search across all Node.js built-in core modules API documentation and get back a list of core modules and their methods when you want to search and look-up Node.js API support
      </use_case>
      <important_notes>
        1. HIGH PRIORITY: *ALWAYS* use this tool first so that you can search for Node.js modules and their methods
        2. Ideally you want to suggest users the use of built-in Node.js API rather than third-party libraries
        3. This tool will return a list of all Node.js core modules and their methods
      </important_notes>
      `,
    inputSchema: {
      type: 'object',
      properties: {},
    },
    async handler () {
      logger.info({
        msg: `Tool execution started: ${toolName}`,
      })
      let listContent = 'Available Node.js core modules and their methods:\n\n'

      for (const module of modules) {
        listContent += await apiDocsService.getFormattedModuleSummary(module)
      }

      return { content: [{ type: 'text', text: listContent }] }
    },
  }
}

/**
 * One tool that serves documentation for all modules
 *
 * Instead of overwhelming the LLM with as many tools as there are core modules
 * in Node.js, this creates a single tool that accepts modules information
 * and returns their data as a response.
 */
export async function createModulesTool () {
  const toolName = 'retrieve-nodejs-modules-api-documentation'
  const toolDescription = `
  Retrieve, fetch, and get Node.js API documentation for a specific module or class.

  <use_case>
    Use this tool to retrieve Node.js API documentation for a specific module or class.
  </use_case>

  <example>
    User asks: "How can I user colors in my terminal console output using Node.js?"

    You call the \`retrieve-nodejs-modules-api-documentation\` MCP tool with the following parameters:
    \`\`\`json
    {
      "module": "util",
      "method": "styleText"
    }
    \`\`\`
  </example>

  <important_notes>
    1. If you don't know the module or class name, you can use the \`search-nodejs-modules-api-documentation\` tool to get a list of all Node.js core API modules and their methods to search for it first and then call this tool.
    2. This tool will return the documentation for the specified module or class, including its methods and properties.
  </important_notes>
  `

  const tools: ToolsDictionary = {}

  const tool: ToolDefinition = {
    name: toolName,
    description: toolDescription,
    inputSchema: {
      type: 'object',
      properties: {
        module: {
          type: 'string',
          description: 'The module or class name to retrieve Node.js API documentation for',
        },
        method: {
          type: 'string',
          description: 'The method name to retrieve Node.js API documentation for',
        },
      },
      required: ['module'],
    },
    async handler (params) {
      logger.info({ msg: `Tool execution started: ${toolName}`, params })
      try {
        // TBD extract the module or class name out of all modules documentation
        const { modules } = await apiDocsService.getApiDocsModules()

        // @TODO the tool only uses the module name to find a matching module
        // and doesn't match against the method name or the class name
        // probably good enough for results but open to improvements, especially
        // if there's more data points around methods and classes that should
        // be returned
        const module = modules.find((mod) => apiDocsService.normalizeModuleName(mod.name) === params.module)
        if (!module) {
          return {
            content: [{ type: 'text', text: `Module not found: ${params.module}\n\nMaybe you spelled the module name wrong?` }],
          }
        }

        const content = await apiDocsService.getFormattedModuleDoc(module, { class: params.module, method: params.method })
        logger.info({ msg: `Tool execution successful: ${toolName}` })
        return { content: [{ type: 'text', text: content }] }
      } catch (error) {
        logger.error({
          err: error,
          params,
          msg: `Tool execution failed: ${toolName}`,
        })
        throw error
      }
    },
  }

  tools[toolName] = tool
  return tools
}

//
// Note: Archived in favor of a single tool that serves all modules
//
// export async function createModuleTools () {
//   const tools: ToolsDictionary = {}
//   const { modules } = await apiDocsService.getApiDocsModules()

//   modules.forEach((module) => {
//     const { name, textRaw } = module
//     const toolName = apiDocsService.normalizeModuleName(name)

//     logger.info({ msg: `Creating tool: ${toolName}` })

//     const descFormatted = `Node.js API: ${textRaw}`

//     // eslint-disable-next-line security/detect-object-injection
//     tools[toolName] = {
//       name: toolName,
//       description: descFormatted,
//       inputSchema: {
//         type: 'object',
//         properties: {
//           class: {
//             type: 'string',
//             description: 'The class name to search for.',
//           },
//           method: {
//             type: 'string',
//             description: 'The method name to search for.',
//           },
//           required: false,
//         },
//       },
//       async handler (params) {
//         logger.info({ msg: `Tool execution started: ${toolName}`, params })
//         try {
//           const content = await apiDocsService.getFormattedModuleDoc(module, params)
//           logger.info({ msg: `Tool execution successful: ${toolName}` })
//           return { content: [{ type: 'text', text: content }] }
//         } catch (error) {
//           logger.error({
//             err: error,
//             params,
//             msg: `Tool execution failed: ${toolName}`,
//           })
//           throw error
//         }
//       },
//     }
//   })

//   return tools
// }
