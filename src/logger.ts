import winston from "winston";
import "winston-daily-rotate-file";


export function createLogger(logPath: string): winston.Logger {
  return winston.createLogger({
    level:  "silly",
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`)
        )
      }),
      new winston.transports.DailyRotateFile({
        filename: `${logPath}/qnote-%DATE%-combined.log`,
        maxFiles: "14d"
      }),
      new winston.transports.DailyRotateFile({
        filename: `${logPath}/qnote-%DATE%-error.log`,
        level:    "error",
        maxFiles: "14d"
      })
    ]
  });
}
