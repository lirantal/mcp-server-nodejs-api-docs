import { initLogger } from '../utils/logger.ts'
import { DocsFormatter } from './docs-formatter-service.ts'

export class ApiDocsService {
  constructor () {
    this.logger = initLogger()
    this.docsFormatter = new DocsFormatter()
    this.url = 'https://nodejs.org/docs/latest/api/all.json'
    this.modulesData = null
  }

  async fetchNodeApiDocs () {
    this.logger.info({ msg: 'Fetching Node.js API documentation...' })
    try {
      const response = await fetch(this.url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      this.logger.info({ msg: 'Successfully fetched Node.js API documentation', url: this.url })
      return data
    } catch (error) {
      this.logger.error({ err: error, msg: `Failed to fetch Node.js API documentation: ${this.url}` })
      throw error
    }
  }

  normalizeModuleName (name) {
    return this.docsFormatter.normalizeModuleName(name)
  }

  async getApiDocsModules () {
    if (this.modulesData) {
      // return from cached data
      return this.modulesData
    }

    const apiDocs = await this.fetchNodeApiDocs()

    // Remove entries without Class or Method
    const originalCount = apiDocs.modules?.length
    apiDocs.modules = apiDocs.modules.filter(module =>
      module?.classes?.length > 0 || module?.methods?.length > 0
    )
    this.logger.info({ msg: `Modules count: ${originalCount}` })

    // persist the data in the class instance before returning
    this.modulesData = {
      modules: apiDocs.modules
    }

    return this.modulesData
  }

  async getFormattedModuleDoc (moduleData, options = {}) {
    if (!moduleData) {
      return ''
    }

    return this.docsFormatter.createModuleDocumentation(moduleData, options)
  }

  async getFormattedModuleSummary (moduleData) {
    if (!moduleData) {
      return ''
    }

    return this.docsFormatter.formatModuleSummary(moduleData)
  }
}
