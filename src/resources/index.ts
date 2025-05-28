import type { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { initLogger, type Logger } from '../utils/logger.ts'
import { CacheService } from '../services/cache-service.ts'
import type { ReadResourceRequest } from '@modelcontextprotocol/sdk/types.js'

const logger: Logger = initLogger()
const cacheService = new CacheService()

export async function initializeResources(server: Server): Promise<void> {
  logger.info({ msg: 'Initializing resources...' })

  const resources = [
    {
      uri: 'nodejs://releases-schedule-chart.svg',
      name: 'Node.js Releases Schedule Chart',
      description: 'A chart showing the release schedule of Node.js versions.',
      mimeType: 'image/svg+xml',
      handler: async (request: ReadResourceRequest) => {
        logger.info({ msg: 'Resource URI Access:', uri: request.params.uri })

        const resourceNodejsReleasesChartURL =
          'https://raw.githubusercontent.com/nodejs/Release/main/schedule.svg?sanitize=true'

        // Fetch SVG data with cache on each request
        const resourceNodejsReleasesChartSVGText = await cacheService.fetchHttpWithCache(
          resourceNodejsReleasesChartURL,
          {
            responseType: 'text',
            ttlDays: 7
          }
        )

        return {
          contents: [
            {
              uri: request.params.uri,
              text: resourceNodejsReleasesChartSVGText
            }
          ]
        }
      }
    }
  ]

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resourcesList = resources.map((resource) => {
      return {
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType || 'text/plain'
      }
    })

    return {
      resources: resourcesList
    }
  })

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const resource = resources.find((resource) => {
      return resource.uri === request.params.uri
    })

    if (resource) {
      return await resource.handler(request)
    }

    throw new Error(`Resource not found: ${request.params.uri}`)
  })
}
