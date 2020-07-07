import path from "path";
import process from "process";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Connection, createConnection, getManager } from "typeorm";
import express, { Router } from "express";
import bodyParser from "body-parser";
import fs from "fs-extra";
import winston from "winston";
import * as routers from "./router";
import * as entities from "./entity";
import { User, Note } from "./entity";
import { createLogger } from "./logger";


class App {
  public readonly dataPath: string;
  public readonly logPath: string;
  public readonly jwtSecret: string;

  public logger: winston.Logger;
  private server: http.Server;
  public router: express.Application;
  public db: Connection

  public constructor() {
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

  private async establishDatabaseConnection() {
    try {
      this.db = await createConnection({
        type:               "mongodb",
        url:                "mongodb://localhost/qnote",
        logger:             "advanced-console",
        entities:           Object.values(entities),
        synchronize:        true,
        useNewUrlParser:    true,
        useUnifiedTopology: true
      });

      const userCount = await getManager().count(User);
      const noteCount = await getManager().count(Note);

      logger.info("连接数据库成功。");
      logger.info(`现有 ${userCount} 名用户，${noteCount} 条笔记。`);
    } catch (err) {
      logger.info(err);
      logger.error("连接数据库失败。");
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

    this.router.use(express.static(path.join(__dirname, "../public")));

    const apiRouter = Router();
    apiRouter.use("/", routers.publicRouter);
    apiRouter.use("/user", routers.userRouter);
    apiRouter.use("/note", routers.noteRouter);

    this.router.use("/api", apiRouter);
  }

  private async setupServer() {
    this.server = http.createServer(this.router);

    try {
      await new Promise((resolve, reject) => {
        this.server.listen(3000);
        this.server.on("listening", () => resolve());
        this.server.on("error", err => reject(err));
      });
      logger.info("监听 HTTP 端口成功。");
    } catch (err) {
      logger.info(err);
      logger.error("监听 HTTP 端口失败。");
      throw err;
    }
  }

  public async start() {
    try {
      logger.info(`QNote v${this.version}`);

      await this.establishDatabaseConnection();
      this.setupRouter();
      await this.setupServer();

      logger.info("服务器启动成功。");
    } catch {
      logger.info("服务器启动失败。");
      this.stop();
      process.exit(1);
    }
  }

  public stop() {
    if (this.db && this.db.isConnected) {
      this.db.close();
      logger.info("数据库连接关闭。");
    }
    if (this.server && this.server.listening) {
      this.server.close();
      logger.info("停止监听 HTTP 端口。");
    }
    logger.info("服务器程序退出。");
  }
}


process.on("exit", () => {
  app.stop();
});


export const app = new App();
export const logger = app.logger;

app.start();
