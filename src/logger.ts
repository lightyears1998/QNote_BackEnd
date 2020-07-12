import winston from "winston";
import "winston-daily-rotate-file";


export function createLogger(logPath: string): winston.Logger {
  return winston.createLogger({
    exitOnError: false,
    level:       "silly",
    format:      winston.format.combine(
      winston.format.json(),
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      winston.format.errors({ stack: true }),
      winston.format.prettyPrint(),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(info => {
            const label = info.label ? ` [${info.label}]` : "";
            const errorStack = info.stack ? `\n${info.stack}` : "";
            return `${info.timestamp}` + label + ` ${info.level}: ${info.message}` + errorStack;
          })
        )
      }),
      new winston.transports.DailyRotateFile({
        filename:  `${logPath}/qnote-%DATE%-combined.log`,
        auditFile: `${logPath}/qnote-combined-audit.json`,
        maxFiles:  "14d",
        maxSize:   "32mb"
      }),
      new winston.transports.DailyRotateFile({
        filename:  `${logPath}/qnote-%DATE%-error.log`,
        auditFile: `${logPath}/qnote-error-audit.json`,
        level:     "error",
        maxFiles:  "14d",
        maxSize:   "32mb"
      })
    ]
  });
}
