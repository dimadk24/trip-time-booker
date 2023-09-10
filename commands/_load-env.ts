import path from 'path'
import { loadEnvConfig } from '@next/env'

const projectPath = path.resolve(__dirname, '..')

loadEnvConfig(projectPath, process.env.NODE_ENV === 'development')
