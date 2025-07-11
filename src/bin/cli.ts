import { debuglog } from 'node:util'
import { startServer } from '../main.ts'
const debug = debuglog('mcp-server-nodejs-api-docs')

debug('Starting Server...')
startServer()
