import winston from "winston";


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
          winston.format.printf(info => `${info.level}: ${info.message}`)
        )
      }),
      new winston.transports.File({ filename: `${logPath}/combined.log`, maxFiles: 10, maxsize: 1024 }),
      new winston.transports.File({ filename: `${logPath}/error.log`, level: "error", maxFiles: 10, maxsize: 1024 })
    ]
  });
}
