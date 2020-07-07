import express from "express";
import * as HTTP_STATUS from "http-status-codes";
import { JsonObject } from "type-fest";
import { uncapsule, capsule } from "../util";
import { User } from "../entity";


export interface UserToken {
  userID: string
  username: string
}


export function generateUserToken(user: User): string {
  const token: UserToken = {
    userID:   user.id.toHexString(),
    username: user.username
  };

  return capsule(token as unknown as JsonObject);
}


export function parseUserToken(token: string): UserToken {
  const parsedToken = uncapsule(token);

  const keys: Array<keyof UserToken> = ["userID", "username"];
  for (const key of keys) {
    if (key in parsedToken === false) {
      throw "Token 格式不正确。";
    }
  }

  return {
    userID:   String(parsedToken.id),
    username: String(parsedToken.username)
  };
}


export const UserTokenHanler: express.Handler = function (req, res, next) {
  if (req.method !== "OPTIONS") {
    const token = req.params.token || req.query.token || req.body.token;
    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).send("必须携带 Token 参数。");
      return;
    }

    try {
      parseUserToken(token);
    } catch (err) {
      res.status(HTTP_STATUS.UNAUTHORIZED).send("Token 无效。");
      return;
    }
  }

  next();
};
