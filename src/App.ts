import path from "path";
import process from "process";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Connection, createConnection, getManager } from "typeorm";
import express, { Router } from "express";
import expressWinston from "express-winston";
import bodyParser from "body-parser";
import fs from "fs-extra";
import { config as loadEnvironmentVariables } from "dotenv";
import winston from "winston";
import * as routers from "./router";
import * as entities from "./entity";
import { User, Note, Mail } from "./entity";
import { createLogger } from "./logger";
import {
  mottoController,
  mailingController,
  emailVerificationController,
  captchaController,
  scheduler
} from "./controller";


class App {
  public readonly dataPath: string;
  public readonly logPath: string;
  public readonly jwtSecret: string;

  public logger: winston.Logger;
  private server: http.Server;
  private apiRouter: express.Router;
  public router: express.Application;
  public db: Connection

  public constructor() {
    loadEnvironmentVariables();

    this.dataPath = path.resolve(__dirname, "../var/");
    this.logPath = path.resolve(this.dataPath, "./log");

    this.ensureDataPath();
    this.setupLogger();

    this.router = express();
    this.jwtSecret = uuidv4();
  }

  public get version(): string {
    try {
      const packageFile = fs.readFileSync(path.resolve(__dirname, "../package.json"), { encoding: "utf-8" });
      const packageMeta = JSON.parse(packageFile);
      if (packageMeta.version) {
        return String(packageMeta.version);
      }
    } catch {
      return "unknown";
    }
  }

  public async sendMail(mail: Mail) {
    await mailingController.sendMail(mail.to, mail.subject, mail.htmlBody);
  }

  private async establishDatabaseConnection() {
    try {
      this.db = await createConnection({
        type:               "mongodb",
        url:                "mongodb://localhost/qnote",
        loggerLevel:        "debug",
        logging:            String(process.env.DB_DEBUG).toLowerCase() === "true",
        logger:             "advanced-console",
        entities:           Object.values(entities),
        synchronize:        true,
        useNewUrlParser:    true,
        useUnifiedTopology: true
      });

      const userCount = await getManager().count(User);
      const noteCount = await getManager().count(Note);

      logger.info("连接数据库成功。", { label: "数据库" });
      logger.info(`现有 ${userCount} 名用户，${noteCount} 条笔记。`, { label: "数据库" });
    } catch (err) {
      logger.error("连接数据库失败。", { label: "数据库" });
      throw err;
    }
  }

  private ensureDataPath() {
    fs.ensureDirSync(this.dataPath);
    fs.ensureDirSync(this.logPath);
  }

  private setupLogger() {
    this.logger = createLogger(this.logPath);
  }

  private setupRouter() {
    this.router.use(bodyParser.json());
    this.router.use(bodyParser.urlencoded({ extended: true }));

    this.router.use(routers.CorsHandler);

    this.router.use(express.static(path.join(__dirname, "../public"), {
      maxAge: "30 days"
    }));

    this.apiRouter = Router();
    this.apiRouter.use(expressWinston.logger({
      transports: this.logger.transports,
      format:     this.logger.format
    }));
    this.apiRouter.use(expressWinston.errorLogger({
      transports: this.logger.transports,
      format:     this.logger.format
    }));
    this.apiRouter.use("/", routers.publicRouter);
    this.apiRouter.use("/user", routers.userRouter);
    this.apiRouter.use("/note", routers.noteRouter);

    this.router.use("/api", this.apiRouter);
  }

  private setupControllers(): void {
    scheduler.init();

    mottoController.init();
    this.apiRouter.use("/motto", mottoController.getRouter());

    mailingController.init();
    emailVerificationController.init();
    captchaController.init();
  }

  private startStatefulControllers(): void {
    scheduler.start();
  }

  private stopStatefulControllers(): void {
    scheduler.stop();
  }

  private async setupServer() {
    this.server = http.createServer(this.router);

    try {
      await new Promise((resolve, reject) => {
        this.server.listen(3000);
        this.server.on("listening", () => resolve());
        this.server.on("error", err => reject(err));
      });
      logger.info("监听 HTTP 端口成功。", { label: "HTTP" });
    } catch (err) {
      logger.error("监听 HTTP 端口失败。", { label: "HTTP" });
      throw err;
    }
  }

  public async start() {
    try {
      logger.info(`QNote v${this.version}`);

      await this.establishDatabaseConnection();
      this.setupRouter();
      this.setupControllers();
      this.startStatefulControllers();
      await this.setupServer();

      logger.info("服务器启动成功。", { label: "App" });
    } catch (err) {
      logger.error(err);
      logger.error("服务器启动失败。", { label: "App" });
      await this.stop();

      // set the `process.exitCode` rather than call `process.exit()`,
      // which allows the process to exit naturally by avoiding scheduling any additional work for the event loop.
      //
      // @see <https://stackoverflow.com/a/37592669/8762529>
      process.exitCode = 1;
    }
  }

  public async stop() {
    if (this.server && this.server.listening) {
      await new Promise((resolve) => {
        this.server.close(() => resolve());
      });
      logger.info("停止监听 HTTP 端口。", { label: "HTTP" });
    }

    this.stopStatefulControllers();

    if (this.db && this.db.isConnected) {
      await this.db.close();
      logger.info("数据库连接关闭。", { label: "数据库" });
    }
  }
}


process.on("exit", () => {
  app.stop();
  logger.info("服务器程序退出。", { label: "App" });
});


export const app = new App();
export const logger = app.logger;

app.start();
