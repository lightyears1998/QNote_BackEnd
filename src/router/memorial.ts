import express, { Request, Response } from "express";
import { body } from "express-validator";
import { JsonObject } from "type-fest";
import { getMongoManager } from "typeorm";
import { Memorial } from "../entity";
import { getCurrentUser, UserTokenHandler } from "./token";
import { ArgumentValidationResultHandler } from "./util";


export const memorialRouter = express.Router();


/**
 * 纪念日路由
 */
memorialRouter.use(UserTokenHandler);


memorialRouter.post("/", async (req: Request, res: Response<JsonObject>) => {
  const db = getMongoManager();
  const { username } = getCurrentUser(res);

  const memorials = await db.find(Memorial, { username });
  res.json(({
    memorial: memorials.map(memorial => ({
      title: memorial.title,
      date:  memorial.date
    }))
  }));
});


memorialRouter.post("/add", [
  body("title").isString().notEmpty(),
  body("date").isDate(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<JsonObject>) => {
  const db = getMongoManager();
  const { username } = getCurrentUser(res);
  const { title, date } = req.body;

  let isUpdate = true;
  let memorial = await db.findOne(Memorial, { title });

  if (!memorial) {
    memorial = new Memorial();
    memorial.username = username;
    memorial.title = title;
    isUpdate = false;
  }

  memorial.date = date;

  memorial = await db.save(Memorial, memorial);

  res.send({
    isUpdate,
    memorial: {
      title: memorial.title,
      date:  memorial.date
    }
  });
});


memorialRouter.post("/delete", [
  body("title").isString().notEmpty(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<JsonObject>) => {
  const db = getMongoManager();
  const { title } = req.body;

  let isDeleted = false;
  const memorial = await db.findOne(Memorial, { title });

  if (memorial) {
    await db.remove(Memorial, memorial);
    isDeleted = true;
  }

  res.json({
    isDeleted
  });
});
