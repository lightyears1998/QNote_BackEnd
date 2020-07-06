import path from "path";
import process from "process";
import http from "http";
import { v4 as uuidv4 } from "uuid";
import { Connection, createConnection, getManager } from "typeorm";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs-extra"
import * as routers from "./router";
import * as entities from "./entity";
import { CorsHandler } from "./util";
import { User, Note } from "./entity";
import { JsonWebTokenError } from "jsonwebtoken";


class App {
  public readonly jwtSecret: string;
  private server: http.Server;
  public router: express.Application;
  public db: Connection

  public constructor() {
    this.router = express();
    this.jwtSecret = uuidv4();
  }

  public get version(): string {
    try {
      const packageFile = fs.readFileSync(path.resolve(__dirname, "../package.json"), {encoding: 'utf-8'})
      const packageMeta = JSON.parse(packageFile)
      if (packageMeta.version) {
        return String(packageMeta.version)
      }
    } catch {
      return "unknown"
    }
  }

  private async establishDatabaseConnection() {
    try {
      this.db = await createConnection({
        type:               "mongodb",
        url:                "mongodb://localhost/user",
        logger:             "advanced-console",
        entities:           Object.values(entities),
        useNewUrlParser:    true,
        useUnifiedTopology: true
      });

      const userCount = await getManager().count(User);
      const noteCount = await getManager().count(Note);

      console.log("连接数据库成功。");
      console.log(`现有 ${userCount} 名用户，${noteCount} 条笔记。`);
    } catch (err) {
      console.log(err);
      console.error("连接数据库失败。");
      throw err;
    }
  }

  private setupRouter() {
    this.router.use(bodyParser.json());
    this.router.use(bodyParser.urlencoded({ extended: true }));
    this.router.use(CorsHandler);

    this.router.use(express.static(path.join(__dirname, "../public")));

    this.router.use(routers.userRouter);
  }

  private async setupServer() {
    this.server = http.createServer(this.router);

    try {
      await new Promise((resolve, reject) => {
        this.server.listen(3000);
        this.server.on("listening", () => resolve());
        this.server.on("error", err => reject(err));
      });
      console.log("监听 HTTP 端口成功。");
    } catch (err) {
      console.log(err);
      console.error("监听 HTTP 端口失败。");
      throw err;
    }
  }

  public async start() {
    console.log(`QNote v${this.version}`);

    try {
      await this.establishDatabaseConnection();
      this.setupRouter();
      await this.setupServer();

      console.log("服务器启动成功。");
    } catch {
      console.log("服务器启动失败。");
      if (this.db && this.db.isConnected) {
        this.db.close();
      }
      process.exit(1);
    }
  }
}


const app = new App();
export default app;
