import path from "path";
import express, { Request, Response } from "express";
import { getManager } from "typeorm";
import * as HTTP_STATUS from "http-status-codes";
import { body } from "express-validator";
import multer from "multer";
import fs from "fs-extra";
import sha1 from "sha1";
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


const avatarStoragePath = path.resolve(__dirname, "../../var/avatars");
fs.ensureDirSync(avatarStoragePath);

function getAvatarFilePath(avatarFilename: string) {
  return path.resolve(avatarStoragePath, `./${avatarFilename.substr(0, 2)}/`, avatarFilename);
}

userRouter.get("/avatar", async (req: Request, res: Response<unknown>) => {
  const db = getManager();

  const { username } = getCurrentUser(res);
  const user = await db.findOneOrFail(User, { username });

  if (user.avatar) {
    res.sendFile(getAvatarFilePath(user.avatar));
  } else {
    res.json("用户没有设置头像。");
  }
});

userRouter.post("/avatar", multer({ limits: {
  fileSize: 1024 * 1024 * 2 // 2 MiB
} }).single("avatar"), async (req: Request, res: Response<unknown>) => {
  const db = getManager();

  const { username } = getCurrentUser(res);
  let user = await db.findOneOrFail(User, { username: username });

  const extname = path.extname(req.file.originalname);
  if (!extname) {
    res.json("必须上传带有拓展名的图片。");
  }

  const avatarFilename = `${sha1(username)}${extname}`;
  const avatarFilePath = getAvatarFilePath(avatarFilename);
  const avatarDirPath = path.dirname(avatarFilePath);

  if (user.avatar) {
    await fs.remove(getAvatarFilePath(user.avatar));
  }

  await fs.ensureDir(avatarDirPath);
  await fs.writeFile(avatarFilePath, req.file.buffer);

  user.avatar = avatarFilename;
  user.avatarUrl = `/avatars/${user.avatar.substr(0, 2)}/${user.avatar}`;
  user = await db.save(User, user);

  res.json(user);
});

export {
  userRouter
};
