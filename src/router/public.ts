import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { body } from "express-validator";
import { getManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { JsonObject } from "type-fest";
import { User } from "../entity";
import { logger } from "..";
import { emailVerificationController } from "../controller";
import { generateUserToken, parseUserToken } from "./token";
import { ArgumentValidationResultHandler } from "./util";


/**
 * 不需要凭证就能访问的路由
 */
const publicRouter = express.Router();


publicRouter.post("/signin", [
  body("email").notEmpty().isEmail(),
  body("password").notEmpty().isString(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<string | JsonObject>) => {
  const db = getManager();
  const email = String(req.body.email).toLowerCase();
  const password = String(req.body.password);

  const user = await db.findOne(User, { email: email });

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).send("邮箱地址对应的用户不存在。");
    return;
  }

  try {
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      res.status(HTTP_STATUS.UNAUTHORIZED).send("密码错误。");
      return;
    }

    const token = generateUserToken(user);
    res.status(HTTP_STATUS.OK).send({ token });
  } catch (err) {
    logger.error(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send();
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


publicRouter.post("/sendEmail", [
  body("email").notEmpty().isEmail()
], async (req: Request, res: Response<JsonObject>) => {
  const email = String(req.body.email);
  try {
    await emailVerificationController.prepareVerificationCode(email);
    res.status(HTTP_STATUS.OK).json({ valid: true });
  } catch (err) {
    logger.error(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ valid: false });
  }
});


publicRouter.post("/checkEmail", [
  body("email").notEmpty().isEmail(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<JsonObject>) => {
  const db = getManager();
  const email = String(req.body.email).toLowerCase();

  if ((await db.count(User, { email: email })) === 0) {
    res.status(HTTP_STATUS.OK).json({ valid: true });
  } else {
    res.status(HTTP_STATUS.OK).json({ valid: false });
  }
});


publicRouter.post("/register", [
  body("email").notEmpty().isString(),
  body("username").notEmpty().isString(),
  body("password").notEmpty().isString(),
  body("verification").notEmpty().isString(),
  ArgumentValidationResultHandler
], async (req: Request, res: Response<JsonObject>) => {
  const db = getManager();
  const displayEmail = String(req.body.email);
  const email = displayEmail.toLowerCase();
  const username = String(req.body.username);
  const password = String(req.body.password);
  const verification = String(req.body.verification).toUpperCase();

  if ((await db.count(User, { username }) + (await db.count(User, { email }))) > 0) {
    res.status(HTTP_STATUS.CONFLICT).send({ msg: "用户名或邮箱地址已被占用。", valid: false });
    return;
  }

  const verified = await emailVerificationController.verifyVerificationCode(email, verification);

  if (!verified) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ msg: "验证码错误。", valid: false });
    return;
  }

  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User(username, hashedPassword);
    user.displayEmail = displayEmail;
    user.email = email;
    await db.save(user);

    res.status(HTTP_STATUS.OK).send({ token: generateUserToken(user), valid: true });
  } catch (err) {
    logger.error(err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send();
  }
});


publicRouter.post("/authToken", [
  body("token").notEmpty().isString()
], async (req: Request, res: Response<JsonObject>) => {
  const { token } = req.body;

  try {
    const { userID, username } = parseUserToken(token);
    res.send({
      ok: true,
      id: userID,
      username
    });
    return;
  } catch (err) {
    res.send({
      ok: false
    });
  }
});

export {
  publicRouter
};
