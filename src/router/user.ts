import express, {Request, Response} from "express";
import { body, validationResult, Result, ValidationError } from "express-validator"
import jwt from "jsonwebtoken";
import { getManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { app } from "..";
import { User, Note } from "../entity";
import { JsonObject } from "type-fest"


const userRouter = express.Router();


userRouter.post("/signin", [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req: Request, res: Response<Result<ValidationError> | string | JsonObject>) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(errors)
  }

  const db = getManager();
  const { username, password } = req.body;

  try {
    await db.findOneOrFail(User, { username: username, password: password });
    const token = jwt.sign({ id: username }, app.jwtSecret);
    res.status(HTTP_STATUS.OK).send({ token });
  } catch (err) {
    console.log(err);
    res.status(HTTP_STATUS.UNAUTHORIZED).send("账号不存在");
  }
});


userRouter.post("/registerName", async (req, res) => {
  const db = getManager();
  const { username } = req.body;

  const user = await db.findOne(User, { username: username });
  if (user) {
    res.status(HTTP_STATUS.OK).send(false);
  } else {
    res.status(HTTP_STATUS.OK).send(true);
  }
});


userRouter.post("/register", async (req, res) => {
  const db = getManager();
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(HTTP_STATUS.CONFLICT).send("两次输入的密码不一致");
    return;
  }

  await db.save(new User(username, password));

  // 创建帐号之后直接进入登录界面
  const token = jwt.sign({ id: username }, app.jwtSecret);
  res.status(HTTP_STATUS.OK).send({ token });
});


userRouter.get("/getMessage/:username", async (req, res) => {
  const db = getManager();
  const username = req.params.username;

  try {
    const note = await db.find(Note, { username: username });
    const user = await db.findOneOrFail(User, { username: username });
    const info = { user, note };
    res.status(HTTP_STATUS.OK).json(info);
  } catch (err) {
    console.log(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});


userRouter.get("/addTask/:username/:noteContent", async (req, res) => {
  const db = getManager();
  const username = req.params.username;
  const noteContent = req.params.noteContent;

  try {
    const user = await db.findOneOrFail(User, { username });

    let note = new Note();
    note.username = username;
    note.noteID = user.noteNum + 1;
    note.noteContent = noteContent;
    note = await db.save(note);

    user.noteNum += 1;
    user.currentNoteNum += 1;
    await db.save(user);

    res.status(HTTP_STATUS.OK).send(`${note.noteID}`);
  } catch (err) {
    console.log(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(undefined);
  }
});


userRouter.post("/completeTask", async (req, res) => {
  const db = getManager();
  const { username } = req.body;
  const noteID = Number(req.body.noteID)

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
    console.log(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});


userRouter.post("/giveUpTask", async (req, res) => {
  const db = getManager();
  const { username } = req.body;
  const noteID = Number(req.body.noteID)

  try {
    const user = await db.findOneOrFail(User, { username });
    user.giveUpNoteNum += 1;

    const note = await db.findOneOrFail(Note, { username, noteID });
    await db.remove(note);
    await db.save(user);

    res.send("done");
  } catch (err) {
    console.log(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});


userRouter.post("/deleteNote", async (req, res) => {
  const { username } = req.body;
  const noteID = Number(req.body.noteID)
  const db = getManager();

  db.delete(Note, { username, noteID });
  res.send("done");
});


export {
  userRouter
};
