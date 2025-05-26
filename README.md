<!-- markdownlint-disable -->

<p align="center"><h1 align="center">
  mcp-server-nodejs-api-docs
</h1>

<p align="center">
  An MCP Server for Node.js API documentation
</p>

<p align="center">
  <a href="https://www.npmjs.org/package/mcp-server-nodejs-api-docs"><img src="https://badgen.net/npm/v/mcp-server-nodejs-api-docs" alt="npm version"/></a>
  <a href="https://www.npmjs.org/package/mcp-server-nodejs-api-docs"><img src="https://badgen.net/npm/license/mcp-server-nodejs-api-docs" alt="license"/></a>
  <a href="https://www.npmjs.org/package/mcp-server-nodejs-api-docs"><img src="https://badgen.net/npm/dt/mcp-server-nodejs-api-docs" alt="downloads"/></a>
  <a href="https://github.com/lirantal/mcp-server-nodejs-api-docs/actions?workflow=CI"><img src="https://github.com/lirantal/mcp-server-nodejs-api-docs/workflows/CI/badge.svg" alt="build"/></a>
  <a href="https://codecov.io/gh/lirantal/mcp-server-nodejs-api-docs"><img src="https://badgen.net/codecov/c/github/lirantal/mcp-server-nodejs-api-docs" alt="codecov"/></a>
  <a href="https://snyk.io/test/github/lirantal/mcp-server-nodejs-api-docs"><img src="https://snyk.io/test/github/lirantal/mcp-server-nodejs-api-docs/badge.svg" alt="Known Vulnerabilities"/></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
</p>

## Usage: CLI

```bash
npx mcp-server-nodejs-api-docs
```

## Usage for Claude Desktop:

Edit your Claude Desktop MCP Servers configuration file (located on macOS here: `~/Library/Application Support/Claude/claude_desktop_config.json`) and add the following:

```json
{
  "mcpServers": {
    "nodejs-api-docs": {
      "command": "npx",
      "args": ["-y", "mcp-server-nodejs-api-docs"]
    }
  }
}
```

## Usage for Cursor AI:

Edit your Cursor AI MCP file (located at `~/.cursor/mcp.json`) and add the following:

```json
{
  "mcpServers": {
    "nodejs-api-docs": {
      "command": "npx",
      "args": ["-y", "mcp-server-nodejs-api-docs"]
    }
  }
}
```

## Development

To build the project with Docker locally run:

```bash
docker build -t mcp-server-nodejs-api-docs .
```

Then run the container as follows for your MCP Server configuration:

```bash
docker run -i --rm --init -e DOCKER_CONTAINER=true mcp-server-nodejs-api-docs
```

## Contributing

Please consult [CONTRIBUTING](./.github/CONTRIBUTING.md) for guidelines on contributing to this project.

## Author

**mcp-server-nodejs-api-docs** © [Liran Tal](https://github.com/lirantal), Released under the [Apache-2.0](./LICENSE) License.
