import winston from 'winston'
import { LOG_LEVEL } from '../config/app-config'

const rootLogger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  transports: [],
})

if (process.env.NODE_ENV !== 'production') {
  rootLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}

const createAppLogger = (logger: string) => rootLogger.child({ logger: logger })

export { rootLogger, createAppLogger }
