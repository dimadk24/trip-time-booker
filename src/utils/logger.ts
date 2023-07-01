import winston from 'winston'
import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import { backendEnv } from '../config/backend-env'

const rootLogger = winston.createLogger({
  level: backendEnv.LOG_LEVEL,
  format: winston.format.json(),
  transports: [],
})

rootLogger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
)

if (backendEnv.NODE_ENV === 'production' && backendEnv.LOGTAIL_TOKEN) {
  const logtail = new Logtail(backendEnv.LOGTAIL_TOKEN)
  rootLogger.add(new LogtailTransport(logtail))
}

const createAppLogger = (logger: string) => rootLogger.child({ logger: logger })

export { rootLogger, createAppLogger }
