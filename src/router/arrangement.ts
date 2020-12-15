import express, { Request, Response } from "express";
import { JsonObject } from "type-fest";
import { getMongoManager } from "typeorm";
import { body } from "express-validator";
import { Arrangement } from "../entity/Arrangement";
import { UserTokenHandler, getCurrentUser } from "./token";
import { ArgumentValidationResultHandler } from "./util";


/**
 * 日程安排路由
 */
export const arrangementRouter = express.Router();


arrangementRouter.use(UserTokenHandler);


arrangementRouter.post("/", async (req: Request, res: Response<JsonObject>) => {
  const db = getMongoManager();
  const { username } = getCurrentUser(res);

  const arrangements = await db.find(Arrangement, { username });
  res.json({
    arrangements: arrangements.map(arr => ({
      id:        arr.id.toHexString(),
      timePoint: arr.timePoint,
      title:     arr.title,
      note:      arr.note
    }))
  });
});


arrangementRouter.post("/add", [
  body("timePoint").isString(),
  body("title").isString().notEmpty(),
  body("note").isString(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<JsonObject>) => {
  const db = getMongoManager();
  const { username } = getCurrentUser(res);
  const { timePoint, title, note } = req.body;

  let arrangement = db.create(Arrangement, { username, timePoint, title, note });
  arrangement = await db.save(Arrangement, arrangement);

  res.send({
    arrangement: {
      id:        arrangement.id.toHexString(),
      timePoint: arrangement.timePoint,
      title:     arrangement.title,
      note:      arrangement.note
    }
  });
});


arrangementRouter.post("/update", [
  body("id").isString().notEmpty(),
  body("timePoint").isString(),
  body("title").isString().notEmpty(),
  body("note").isString(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<JsonObject>) => {
  const db = getMongoManager();
  const { username } = getCurrentUser(res);
  const { id, timePoint, title, note } = req.body;

  let arrangement = await db.findOne(Arrangement, id, { where: username });
  if (!arrangement) {
    res.send({
      arrangement: null
    });
    return;
  }

  Object.assign(arrangement, { timePoint, title, note });
  arrangement = await db.save(Arrangement, arrangement);

  res.send({
    arrangement: {
      id:        arrangement.id.toHexString(),
      timePoint: arrangement.timePoint,
      title:     arrangement.title,
      note:      arrangement.note
    }
  });
});


arrangementRouter.post("/delete", [
  body("id").isString().notEmpty(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<JsonObject>) => {
  const db = getMongoManager();
  const { username } = getCurrentUser(res);
  const { id } = req.body;

  const arrangement = await db.findOne(Arrangement, id, { where: { username } });

  let isDeleted = false;
  if (arrangement) {
    await db.remove(arrangement);
    isDeleted = true;
  }

  res.send({
    isDeleted
  });
});
