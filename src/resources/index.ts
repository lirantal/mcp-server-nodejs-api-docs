import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { initLogger } from '../utils/logger.ts'

const logger = initLogger()

export async function initializeResources (server) {
  logger.info({ msg: 'Initializing resources...' })

  const resourceNodejsReleasesChartURL =
    'https://raw.githubusercontent.com/nodejs/Release/main/schedule.svg?sanitize=true'
  const resourceNodejsReleasesChart = await fetch(
    resourceNodejsReleasesChartURL
  )

  if (!resourceNodejsReleasesChart.ok) {
    logger.error({
      msg: `Failed to fetch Node.js releases chart: ${resourceNodejsReleasesChart.status} ${resourceNodejsReleasesChart.statusText}`,
    })
    throw new Error(
      `Failed to fetch Node.js releases chart: ${resourceNodejsReleasesChart.status} ${resourceNodejsReleasesChart.statusText}`
    )
  }

  const resourceNodejsReleasesChartSVGText =
    await resourceNodejsReleasesChart.text()

  const resources = [
    {
      uri: 'nodejs://releases-schedule-chart.svg',
      name: 'Node.js Releases Schedule Chart',
      description: 'A chart showing the release schedule of Node.js versions.',
      mimeType: 'image/svg+xml',
      handler: async (request) => {
        logger.info({ msg: 'Resource URI Access:', uri: request.params.uri })

        return {
          contents: [
            {
              uri: request.params.uri,
              text: resourceNodejsReleasesChartSVGText,
            },
          ],
        }
      },
    },
  ]

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resourcesList = resources.map((resource) => {
      return {
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType || 'text/plain',
      }
    })

    return {
      resources: resourcesList,
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
