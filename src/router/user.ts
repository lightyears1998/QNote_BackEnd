import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import { getManager, AdvancedConsoleLogger } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { app } from "..";
import { User, Note } from "../entity";


const userRouter = express.Router();


userRouter.post("/signin", async (req, res) => {
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
  }

  const user = new User(username, password);
  db.create(User, user);

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
  const username = req.params.username;
  const noteContent = req.params.noteContent;

  try {
    getManager().transaction(async db => {
      const user = await db.findOneOrFail(User, {username})

      let note =  {
        username,
        noteID: user.noteNum + 1,
        noteContent
      } as Note;

      note = await db.save(Note, {
        username,
        noteID: user.noteNum + 1,
        noteContent
      });

      user.noteNum += 1;
      user.currentNoteNum += 1;
      await db.save(user);

      res.send(note.noteID);
    })
  } catch(err) {
    console.log(err)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(undefined);
  }
});


userRouter.post("/completeTask", async (req, res) => {
  const { username, noteID } = req.body;

  try {
    getManager().transaction(async db => {
      const user = await db.findOneOrFail(User, {username})
      user.completeNoteNum += 1;
      user.currentNoteNum -= 1;

      const note = await db.findOneOrFail(Note, {username, noteID})
      note.done = true;
      await db.save(note);
      await db.save(user);

      res.send('done')
    })
  } catch (err) {
    console.log(err)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
});


userRouter.post("/giveUpTask", async (req, res) => {
  const { username, noteID } = req.body;

  try {
    getManager().transaction(async db => {
      const user = await db.findOneOrFail(User, {username});
      user.giveUpNoteNum += 1;

      const note = await db.findOneOrFail(Note, {username, noteID});
      await db.remove(note);
      await db.save(user);
    })

    res.send('done')
  } catch (err) {
    console.log(err)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
});


userRouter.post("/deleteNote", async (req, res) => {
  const { username, noteID } = req.body;
  const db = getManager()

  db.remove(Note, {username, noteID});
  res.send("done");
});


export {
  userRouter
};
