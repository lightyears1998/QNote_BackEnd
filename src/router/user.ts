import express, { Request, Response } from "express";
import { body, validationResult, Result, ValidationError } from "express-validator";
import { getManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { User, Note } from "../entity";
import { UserTokenHanler } from "./token";


const userRouter = express.Router();


userRouter.use(UserTokenHanler);


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


export {
  userRouter
};
