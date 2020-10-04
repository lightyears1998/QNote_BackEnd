import express, { Request, Response } from "express";
import { getManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { body } from "express-validator";
import { User, Note } from "../entity";
import { logger } from "..";
import { UserTokenHandler, getCurrentUser } from "./token";
import { ArgumentValidationResultHandler } from "./util";


const userRouter = express.Router();


userRouter.use(UserTokenHandler);


userRouter.get("/getMessage", async (req: Request, res: Response<unknown>) => {
  const db = getManager();
  const { username } = getCurrentUser(res);

  try {
    const note = await db.find(Note, { username: username });
    const user = await db.findOneOrFail(User, { username: username });
    user.desensitization();
    if (!user.nickname) {
      user.nickname = user.username;
    }

    const info = { user, note };
    res.status(HTTP_STATUS.OK).json(info);
  } catch (err) {
    logger.info(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});


userRouter.post("/nickname", [
  body("nickname").isString().notEmpty(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<unknown>) => {
  const db = getManager();

  const nickname = req.body.nickname;
  const { username } = getCurrentUser(res);

  let user = await db.findOneOrFail(User, { username: username });
  user.nickname = nickname;

  user = await db.save(User, user);
  user.desensitization();

  res.json({
    user
  });
});


export {
  userRouter
};
