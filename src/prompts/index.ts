import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { initLogger } from '../utils/logger.ts'

const logger = initLogger()

export async function initializePrompts (server) {
  logger.info({ msg: 'Initializing prompts...' })

  const prompts = {
    'nodejs-api-lookup': {
      name: 'nodejs-api-lookup',
      description:
        'Search up-to-date knowledge for Node.js modules API Documentation',
      arguments: [
        {
          name: 'module',
          description: 'The name of the Node.js module to search for.',
          required: false,
        },
        {
          name: 'method',
          description: 'The name of the method or function to search for.',
          required: false,
        },
      ],
      async handler ({ module: moduleName, method: methodQuery }) {
        const messages = []

        if (moduleName) {
          messages.push({
            role: 'user',
            content: {
              type: 'text',
              text: `Use the Node.js API Documentation tool to provide documentation for the module: ${moduleName}.`,
            },
          })

          return { messages }
        }

        if (methodQuery) {
          messages.push({
            role: 'user',
            content: {
              type: 'text',
              text: `Use the Node.js API Documentation tool to provide documentation about the function or method: ${methodQuery}.`,
            },
          })

          return { messages }
        }

        messages.push({
          role: 'user',
          content: {
            type: 'text',
            text: 'Use the Node.js API Documentation tool to provide documentation about core (built-in) Node.js modules and their methods',
          },
        })

        return { messages }
      },
    },
  }

  server.setRequestHandler(ListPromptsRequestSchema, () => {
    const promptsList = Object.values(prompts).map((prompt) => {
      return {
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments,
      }
    })

    return {
      prompts: promptsList
    }
  })

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    if (!Object.hasOwn(prompts, name)) {
      throw new Error(`Prompt ${name} not found`)
    }

    // eslint-disable-next-line security/detect-object-injection
    const prompt = prompts[name]
    if (prompt) {
      return await prompt.handler(args)
    }

    throw new Error('Prompt not found')
  })
}
