import { initLogger } from '../utils/logger.ts'
import { ApiDocsService } from '../services/api-docs-service.ts'

const logger = initLogger()
const apiDocsService = new ApiDocsService()

export async function createSearchTool () {
  const { modules } = await apiDocsService.getApiDocsModules()

  return {
    name: 'search-nodejs-modules-api-documentation',
    description:
      '**HIGH PRIORITY** List all Node.js modules and their methods. **ALWAYS** consult this tool first to look-up the correct module and then use the specific module tool for full api details',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    async handler (args) {
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

export async function createModuleTools () {
  const tools = {}
  const { modules } = await apiDocsService.getApiDocsModules()

  modules.forEach((module) => {
    const { name, textRaw } = module
    const toolName = apiDocsService.normalizeModuleName(name)

    logger.info({ msg: `Creating tool: ${toolName}` })

    const descFormatted = `Node.js API: ${textRaw}`

    // eslint-disable-next-line security/detect-object-injection
    tools[toolName] = {
      name: toolName,
      description: descFormatted,
      inputSchema: {
        type: 'object',
        properties: {
          class: {
            type: 'string',
            description: 'The class name to search for.',
          },
          method: {
            type: 'string',
            description: 'The method name to search for.',
          },
          required: [],
        },
      },
      async handler (params) {
        logger.info({ msg: `Tool execution started: ${toolName}`, params })
        try {
          const content = await apiDocsService.getFormattedModuleDoc(module, params)
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
  })

  return tools
}
