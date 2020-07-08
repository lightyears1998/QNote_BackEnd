import express, { Request, Response } from "express";
import { getManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { User, Note } from "../entity";
import { logger } from "..";
import { UserTokenHanler, getCurrentUser } from "./token";


const userRouter = express.Router();


userRouter.use(UserTokenHanler);


userRouter.get("/getMessage", async (req: Request, res: Response<unknown>) => {
  const db = getManager();
  const { username } = getCurrentUser(res);

  try {
    const note = await db.find(Note, { username: username });
    const user = await db.findOneOrFail(User, { username: username });
    const info = { user, note };
    res.status(HTTP_STATUS.OK).json(info);
  } catch (err) {
    logger.info(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});


export {
  userRouter
};
