import winston from 'winston'
import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import { LOGTAIL_TOKEN, LOG_LEVEL } from '../config/app-config'

const rootLogger = winston.createLogger({
  level: LOG_LEVEL,
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

if (process.env.NODE_ENV === 'production' && LOGTAIL_TOKEN) {
  const logtail = new Logtail(LOGTAIL_TOKEN)
  rootLogger.add(new LogtailTransport(logtail))
}

const createAppLogger = (logger: string) => rootLogger.child({ logger: logger })

export { rootLogger, createAppLogger }
