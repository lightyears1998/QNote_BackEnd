import express, { Request, Response } from "express";
import { body } from "express-validator";
import { getManager, getMongoManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { JsonObject } from "type-fest";
import { User, Note } from "../entity";
import { logger } from "..";
import { UserTokenHanler, getCurrentUser } from "./token";
import { ArgumentValidationResultHandler } from "./util";


export const noteRouter = express.Router();


/**
 * 笔记路由
 */
noteRouter.use(UserTokenHanler);


noteRouter.post("/addTask", [
  body("noteContent").isString().notEmpty(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<JsonObject>) => {
  const db = getMongoManager();
  const { noteContent } = req.body;
  const { userID, username } = getCurrentUser(res);

  try {
    const user = await db.findOneOrFail(User, userID);

    let note = new Note();
    note.username = username;
    note.noteID = user.noteNum + 1;
    note.noteContent = noteContent;
    note = await db.save(note);

    user.noteNum += 1;
    user.currentNoteNum += 1;
    await db.save(user);

    res.status(HTTP_STATUS.OK).send({ noteID: note.noteID });
  } catch (err) {
    logger.info(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ error: err });
  }
});


noteRouter.post("/completeTask", [
  body("username").isString().notEmpty(),
  body("noteID").isNumeric(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<string>) => {
  const db = getManager();
  const { username } = req.body;
  const noteID = Number(req.body.noteID);

  if (getCurrentUser(res).username !== username) {
    res.status(HTTP_STATUS.UNAUTHORIZED).send("登录用户名与当前用户名不匹配。");
    return;
  }

  try {
    const user = await db.findOneOrFail(User, { username });
    user.completeNoteNum += 1;
    user.currentNoteNum -= 1;

    const note = await db.findOneOrFail(Note, { username, noteID });
    note.done = true;
    await db.save(note);
    await db.save(user);

    res.send("done");
  } catch (err) {
    logger.info(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});


noteRouter.post("/giveUpTask", [
  body("username").isString().notEmpty(),
  body("noteID").isNumeric(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<string>) => {
  const db = getManager();
  const { username } = req.body;
  const noteID = Number(req.body.noteID);

  if (getCurrentUser(res).username !== username) {
    res.status(HTTP_STATUS.UNAUTHORIZED).send("登录用户名与当前用户名不匹配。");
    return;
  }

  try {
    const user = await db.findOneOrFail(User, { username });
    user.giveUpNoteNum += 1;

    const note = await db.findOneOrFail(Note, { username, noteID });
    await db.remove(note);
    await db.save(user);

    res.send("done");
  } catch (err) {
    logger.info(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});


noteRouter.post("/deleteNote", [
  body("username").isString().notEmpty(),
  body("noteID").isNumeric(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<string>) => {
  const { username } = req.body;
  const noteID = Number(req.body.noteID);
  const db = getManager();

  db.delete(Note, { username, noteID });
  res.send("done");
});
