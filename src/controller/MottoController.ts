import path from "path";
import { assert } from "console";
import fs from "fs-extra";
import { Handler, Request, Response } from "express";
import { app } from "..";
import { StaticController } from "./base";


/**
 * 每日一言控制器
 *
 * 每日一言功能需要使用来自 [hitokoto-osc/sentences-bundle][bundle] 的额外数据。
 *
 * ``` shell
 * # Perform the following steps to download necessary data.
 * cd qnote-backend
 * git clone https://github.com/hitokoto-osc/sentences-bundle.git --depth=1 var/motto
 * ```
 *
 * [bundle]: https://github.com/hitokoto-osc/sentences-bundle
 */
export class MottoController extends StaticController {
  public init(): void {
    const mottoDataPath = path.resolve(app.dataPath, "./motto");
    const versionFilePath = path.resolve(mottoDataPath, "./version.json");

    const versionData = JSON.parse(fs.readFileSync(versionFilePath, { encoding: "utf-8" }));
    assert(versionData.protocol_version === "1.0.0", "Protocol version must be 1.0.0!");
  }

  public getRouter(): Handler {
    return (req: Request, res: Response, next) => {
      next();
    };
  }
}
