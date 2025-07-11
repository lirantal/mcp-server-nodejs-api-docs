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

interface FormattingOptions {
  class?: string
  method?: string
}

/**
 * Service responsible for formatting Node.js API documentation into readable markdown content
 */
export class DocsFormatter {
  /**
   * Formats content by adding extra newlines for better markdown rendering
   */
  formatContent (content: string): string {
    if (!content) return ''
    return content.replace(/\n/g, '\n\n')
  }

  /**
   * Normalizes a module name for use as a tool identifier
   */
  normalizeModuleName (name: string): string {
    const toolName = `${name.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '')}`
    return toolName.length > 47 ? toolName.slice(0, 47) : toolName
  }

  formatModuleSummary (module: ApiModule): string {
    let content = `## ${module.displayName || module.textRaw} (${module.name})\n`
    content += `Module name or Class name: \`${module.name}\`\n\n`

    if (
      (module.methods && module.methods.length > 0) ||
      (module.modules && module.modules.length > 0)
    ) {
      content += '### Methods\n'

      module?.methods?.forEach((method) => {
        content += `#### ${method.textRaw}\n`
      })

      module?.modules?.forEach((submodules) => {
        submodules?.methods?.forEach((method) => {
          content += `#### ${method.textRaw}\n`
        })
      })
    }

    return content + '\n'
  }

  formatItems (items: ApiMethod[] | ApiClass[] | ApiModule[], title: string, query?: string): string {
    if (!items || items.length === 0) return ''

    let sectionContent = ''

    // Phase 1, look up data inside the current object
    const filteredItems = query
      ? items.filter(
          (item) =>
            item.textRaw.toLowerCase().includes(query.toLowerCase()) ||
            (item.desc && item.desc.toLowerCase().includes(query.toLowerCase()))
        )
      : items

    if (filteredItems.length !== 0) {
      sectionContent = `## ${title}\n\n`
      filteredItems.forEach((item) => {
        sectionContent += `### ${item.textRaw}\n`
        if (item.desc) sectionContent += `${this.formatContent(item.desc)}\n\n`
      })
    }

    // Phase 2, we dive deeper into nested methods inside module?.modules?.methods
    items.forEach((submodule) => {
      if ('methods' in submodule && submodule?.methods) {
        sectionContent += `### ${submodule.textRaw} Methods\n\n`
        submodule.methods.forEach((submethod) => {
          sectionContent += `#### ${submethod.textRaw}\n`
          if (submethod.desc) { sectionContent += `${this.formatContent(submethod.desc)}\n\n` }
        })
      }
    })

    return sectionContent
  }

  createModuleDocumentation (module: ApiModule, { class: classQuery, method: methodQuery }: FormattingOptions = {}): string {
    let content = `# ${module.textRaw}\n\n`

    if (module.desc) {
      content += `## Description\n${this.formatContent(module.desc)}\n\n`
    }

    content += this.formatItems(module.classes || [], 'Classes', classQuery)
    content += this.formatItems(module.methods || [], 'Methods', methodQuery)
    content += this.formatItems(module.modules || [], 'Submodules', methodQuery)

    return content
  }
}
