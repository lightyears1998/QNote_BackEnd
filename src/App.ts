import path, { resolve } from "path";
import { rejects } from "assert";
import { v4 as uuidv4 } from "uuid";
import { Connection, createConnection, getConnectionManager, getManager, AdvancedConsoleLogger } from "typeorm";
import express, { Router } from "express";
import bodyParser from "body-parser";
import * as routes from "./route";
import * as entities from "./entity";
import { CorsHandler } from "./util";


class App {
  public readonly jwtSecret: string;
  public router: express.Application;
  public db: Connection

  public constructor() {
    this.router = express();
    this.jwtSecret = uuidv4();
  }

  private async establishDatabaseConnection() {
    try {
      this.db = await createConnection({
        type:               "mongodb",
        url:                "mongodb://localhost/user",
        logger:             "advanced-console",
        loggerLevel:        "debug",
        logging:            "all",
        entities:           Object.values(entities),
        useNewUrlParser:    true,
        useUnifiedTopology: true
      });
    } catch (err) {
      console.log(err);
      console.error("数据库连接失败。");
    }
  }

  private setupRouter() {
    this.router.use(bodyParser.json());
    this.router.use(bodyParser.urlencoded({ extended: true }));
    this.router.use(CorsHandler);

    this.router.use(express.static(path.join(__dirname, "../public")));

    for (const stuff of Object.values(routes)) {
      if (stuff instanceof Router) {
        this.router.use(stuff as unknown as Router);
        console.log("cool!");
      }
    }
  }

  public async start() {
    await this.establishDatabaseConnection();
    this.setupRouter();

    await new Promise((resolve) => {
      this.router.listen(3000, () => {
        resolve();
      });
    });
  }
}

const app = new App();
export default app;
