import jwt from "jsonwebtoken";
import { JsonObject } from "type-fest";
import { app } from "../";


export function capsule(token: JsonObject): string {
  return jwt.sign(token, app.jwtSecret, { expiresIn: "7d" });
}


/**
 * 当 token 签名无效时抛出 JsonWebTokenError
 * 当 token 过期时抛出 TokenExpiredError
 */
export function uncapsule(token: string): JsonObject {
  return JSON.parse(jwt.verify(token, app.jwtSecret) as string);
}
