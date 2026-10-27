# Development

## Prerequisites

- Node.js compatible with this repository's packages and tooling.
- npm for dependency installation and scripts.

## Setup

```sh
npm install
```

## Common Commands

- `pnpm build` - builds the project.
- `pnpm lint` - runs lint checks.
- `pnpm test` - runs the test suite.

## Repository Notes

The Docker builder and runtime use Node 24.22.1 to match the package engine
requirements. Pull requests build the image without publishing it; pushes to
`main` publish and attest the image using the workflow token.

This repository is organized around the root package `mcp-server-nodejs-api-docs`.
