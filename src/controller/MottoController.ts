import path from "path";
import { assert } from "console";
import fs from "fs-extra";
import { Handler, Request, Response } from "express";
import { JsonObject } from "type-fest";
import * as HTTP_STATUS from "http-status-codes";
import { app, logger } from "..";
import { StaticController } from "./base";


/* eslint-disable camelcase */
interface MottoVersionData {
  protocol_version: string
  bundle_version: string
  updated_at: number
  sentences: Array<MottoCategory>
}


interface MottoCategory {
  name: string
  key: string
  path: string
  size: number
}


interface Motto {
  motto: string
  hitokoto: string
  from?: string
  from_who?: string
}


/**
 * 每日一言控制器
 *
 * 设置 `process.env.MOTTO_ENABLE` 来启用每日一言功能。
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
  private categroies: Array<MottoCategory> = [];
  private sentences: Map<string, Array<Motto>> = new Map();
  private overallSentencesCount = 0;

  public init(): void {
    if (!process.env.MOTTO_ENABLE) {
      return;
    }

    const mottoDataPath = path.resolve(app.dataPath, "./motto");
    const versionFilePath = path.resolve(mottoDataPath, "./version.json");

    const versionData = JSON.parse(fs.readFileSync(versionFilePath, { encoding: "utf-8" })) as MottoVersionData;
    assert(versionData.protocol_version === "1.0.0", "Protocol version must be 1.0.0!");

    logger.info(`每日一言语句库版本：${versionData.bundle_version}`);
    logger.info(`每日一言语句库更新时间：${new Date(versionData.updated_at).toLocaleString()}`);

    versionData.sentences.forEach(category => {
      const sentencesPath = path.resolve(mottoDataPath, category.path);
      const sentences = JSON.parse(fs.readFileSync(sentencesPath, { encoding: "utf-8" })) as Array<Motto>;

      this.categroies.push({
        name: category.name,
        key:  category.key,
        path: sentencesPath,
        size: sentences.length
      });
      this.sentences.set(category.key, sentences);
      this.overallSentencesCount += sentences.length;
    });
  }

  public pickMotto(index?: number): Motto | null {
    if (this.overallSentencesCount === 0) {
      return null;
    }

    if (typeof index === "undefined") {
      index = Math.floor(Math.random() * this.overallSentencesCount);
    }
    index = Math.min(index, this.overallSentencesCount - 1);

    for (const categorizedSentences of this.sentences.values()) {
      if (index - categorizedSentences.length >= 0) {
        index -= categorizedSentences.length;
        continue;
      }

      const motto = categorizedSentences[index];

      return {
        motto:    `${motto.hitokoto}——${motto.from_who ? motto.from_who : ""}《${motto.from}》`,
        hitokoto: motto.hitokoto,
        from:     motto.from,
        from_who: motto.from_who
      };
    }
  }

  public getRouter(): Handler {
    if (!process.env.MOTTO_ENABLE) {
      return (_: Request, res: Response<JsonObject>) => {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({ motto: "每日一言功能已禁用。" });
      };
    }

    return (_: Request, res: Response<JsonObject | Motto>) => {
      const motto = this.pickMotto();

      if (!motto) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ motto: "句子库尚未初始化。" });
        return;
      }

      res.status(HTTP_STATUS.OK).json(motto);
    };
  }
}


export const mottoController = new MottoController();
