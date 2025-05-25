/**
 * Service responsible for formatting Node.js API documentation into readable markdown content
 */
export class DocsFormatter {
  // eslint-disable-next-line no-useless-constructor
  constructor () {
    // Initialize any needed properties here
  }

  /**
   * Formats content by adding extra newlines for better markdown rendering
   */
  formatContent (content) {
    if (!content) return ''
    return content.replace(/\n/g, '\n\n')
  }

  /**
   * Normalizes a module name for use as a tool identifier
   */
  normalizeModuleName (name) {
    const toolName = `get_api_for-${name.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '')}`
    return toolName.length > 64 ? toolName.slice(0, 63) : toolName
  }

  formatModuleSummary (module) {
    let content = `## ${module.displayName || module.textRaw} (${module.name})\n`

    if (
      (module.methods && module.methods.length > 0) ||
      (module.modules && module.modules.length > 0)
    ) {
      content += '### Methods\n'

      module?.methods?.forEach((method) => {
        content += `#### ${method.textRaw}\n`
        content += `#### ${method.desc}\n`
      })

      module?.modules?.forEach((submodules) => {
        submodules?.methods?.forEach((method) => {
          content += `#### ${method.textRaw}\n`
          content += `#### ${method.desc}\n`
        })
      })
    }

    return content + '\n'
  }

  formatItems (items, title, query) {
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
      if (submodule?.methods) {
        sectionContent += `### ${submodule.textRaw} Methods\n\n`
        submodule.methods.forEach((submethod) => {
          sectionContent += `#### ${submethod.textRaw}\n`
          if (submethod.desc) { sectionContent += `${this.formatContent(submethod.desc)}\n\n` }
        })
      }
    })

    return sectionContent
  }

  createModuleDocumentation (module, { class: classQuery, method: methodQuery } = {}) {
    let content = `# ${module.textRaw}\n\n`

    if (module.desc) {
      content += `## Description\n${this.formatContent(module.desc)}\n\n`
    }

    content += this.formatItems(module.classes, 'Classes', classQuery)
    content += this.formatItems(module.methods, 'Methods', methodQuery)
    content += this.formatItems(module.modules, 'Submodules', methodQuery)

    return content
  }
}
