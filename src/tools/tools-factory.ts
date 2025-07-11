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

  return {
    name: 'search-nodejs-modules-api-documentation',
    description:
      '**HIGH PRIORITY** List all Node.js modules and their methods. **ALWAYS** consult this tool first to look-up the correct module and then use the specific module tool for full api details',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    async handler () {
      logger.info({
        msg: 'Tool execution started: search-nodejs-modules-api-documentation',
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
  const toolName = 'api-docs-module-description'
  const toolDescription = 'Use this tool to retrieve Node.js API documentation for a specific module or class, including its methods and descriptions.'

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
