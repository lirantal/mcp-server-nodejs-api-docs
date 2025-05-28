import { initLogger, type Logger } from '../utils/logger.ts'
import { DocsFormatter } from './docs-formatter-service.ts'
import { CacheService } from './cache-service.ts'

// Type definitions for Node.js API documentation structure
interface ApiMethod {
  textRaw: string
  desc?: string
  name?: string
  classes?: ApiClass[]
  methods?: ApiMethod[]
}

interface ApiClass {
  textRaw: string
  desc?: string
  name?: string
  methods?: ApiMethod[]
}

interface ApiModule {
  textRaw: string
  displayName?: string
  name: string
  desc?: string
  classes?: ApiClass[]
  methods?: ApiMethod[]
  modules?: ApiModule[]
}

interface ApiDocsData {
  modules: ApiModule[]
}

interface ModulesData {
  modules: ApiModule[]
}

interface FormattingOptions {
  class?: string
  method?: string
}

export class ApiDocsService {
  private logger: Logger
  private docsFormatter: DocsFormatter
  private cacheService: CacheService
  private url: string
  private modulesData: ModulesData | null

  constructor () {
    this.logger = initLogger()
    this.docsFormatter = new DocsFormatter()
    this.cacheService = new CacheService()
    this.url = 'https://nodejs.org/docs/latest/api/all.json'
    this.modulesData = null
  }

  async fetchNodeApiDocs (): Promise<ApiDocsData> {
    return this.cacheService.fetchHttpWithCache(this.url, {
      responseType: 'json',
      ttlDays: 7 // Cache for 7 days
    }) as Promise<ApiDocsData>
  }

  normalizeModuleName (name: string): string {
    return this.docsFormatter.normalizeModuleName(name)
  }

  async getApiDocsModules (): Promise<ModulesData> {
    if (this.modulesData) {
      // return from cached data
      return this.modulesData
    }

    const apiDocs = await this.fetchNodeApiDocs()

    // Remove entries without Class or Method
    const originalCount = apiDocs.modules?.length
    apiDocs.modules = apiDocs.modules.filter(module =>
      module?.classes?.length && module.classes.length > 0 || 
      module?.methods?.length && module.methods.length > 0
    )
    this.logger.info({ msg: `Modules count: ${originalCount}` })

    // persist the data in the class instance before returning
    this.modulesData = {
      modules: apiDocs.modules
    }

    return this.modulesData
  }

  async getFormattedModuleDoc (moduleData: ApiModule, options: FormattingOptions = {}): Promise<string> {
    if (!moduleData) {
      return ''
    }

    return this.docsFormatter.createModuleDocumentation(moduleData, options)
  }

  async getFormattedModuleSummary (moduleData: ApiModule): Promise<string> {
    if (!moduleData) {
      return ''
    }

    return this.docsFormatter.formatModuleSummary(moduleData)
  }
}
