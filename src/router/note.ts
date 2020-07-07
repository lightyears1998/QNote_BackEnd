import express, { Request, Response } from "express";
import { body, validationResult, Result, ValidationError } from "express-validator";
import { getManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { User, Note } from "../entity";
import { UserTokenHanler } from "./token";


export const noteRouter = express.Router();


noteRouter.use(UserTokenHanler);


noteRouter.get("/addTask/:username/:noteContent", async (req, res) => {
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


noteRouter.post("/completeTask", async (req, res) => {
  const db = getManager();
  const { username } = req.body;
  const noteID = Number(req.body.noteID);

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


noteRouter.post("/giveUpTask", async (req, res) => {
  const db = getManager();
  const { username } = req.body;
  const noteID = Number(req.body.noteID);

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


noteRouter.post("/deleteNote", async (req, res) => {
  const { username } = req.body;
  const noteID = Number(req.body.noteID);
  const db = getManager();

  db.delete(Note, { username, noteID });
  res.send("done");
});
