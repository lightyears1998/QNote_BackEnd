import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { body } from "express-validator";
import { getManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { JsonObject } from "type-fest";
import { User } from "../entity";
import { logger } from "..";
import { generateUserToken } from "./token";
import { ArgumentValidationResultHandler } from "./util";


/**
 * 不需要凭证就能访问的路由
 */
const publicRouter = express.Router();


publicRouter.post("/signin", [
  body("username").notEmpty(),
  body("password").notEmpty(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<string | JsonObject>) => {
  const db = getManager();
  const { username, password } = req.body;

  try {
    const user = await db.findOneOrFail(User, { username: username });

    if (bcrypt.compareSync(password, user.password)) {
      const token = generateUserToken(user);
      res.status(HTTP_STATUS.OK).send({ token });
    } else {
      throw "密码错误。";
    }
  } catch (err) {
    logger.info(err);
    res.status(HTTP_STATUS.UNAUTHORIZED).send("账号不存在或密码错误");
  }
});


publicRouter.post("/registerName", [
  body("username").notEmpty(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<string>) => {
  const db = getManager();
  const { username } = req.body;

  const user = await db.findOne(User, { username: username });
  if (user) {
    res.status(HTTP_STATUS.OK).send("false");
  } else {
    res.status(HTTP_STATUS.OK).send("true");
  }
});


publicRouter.post("/register", [
  body("username").notEmpty(),
  body("password").notEmpty(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<string | JsonObject>) => {
  const db = getManager();
  const { username, password, confirmPassword } = req.body;

  if (confirmPassword && password !== confirmPassword) {
    res.status(HTTP_STATUS.CONFLICT).send("两次输入的密码不一致");
    return;
  }

  if ((await db.count(User, { username })) > 0) {
    res.status(HTTP_STATUS.CONFLICT).send("用户名已被占用");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync());
  const user = await db.save(new User(username, hashedPassword));
  res.status(HTTP_STATUS.OK).send({ token: generateUserToken(user) });
});


export {
  publicRouter
};
