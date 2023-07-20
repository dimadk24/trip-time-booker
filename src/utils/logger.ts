import os from 'os'
import pino from 'pino'
import { backendEnv } from '../config/backend-env'

const targets: (pino.TransportTargetOptions | string | boolean)[] = [
  backendEnv.NODE_ENV !== 'production' && {
    target: 'pino-pretty',
    options: {},
    level: backendEnv.LOG_LEVEL,
  },
  backendEnv.LOGTAIL_TOKEN && {
    target: '@logtail/pino',
    options: {
      sourceToken: backendEnv.LOGTAIL_TOKEN,
    },
    level: backendEnv.LOG_LEVEL,
  },
].filter(Boolean)

const transport = pino.transport({
  targets: targets as pino.TransportTargetOptions[],
})

const rootLogger = pino(
  {
    ...transport,
    base: {
      hostname: os.hostname,
    },
    level: backendEnv.LOG_LEVEL,
  },
  transport
)

const createAppLogger = (name: string) => rootLogger.child({ name: name })

export { createAppLogger }
