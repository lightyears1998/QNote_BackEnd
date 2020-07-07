import jwt from "jsonwebtoken";
import { JsonObject } from "type-fest";
import { app } from "./App";


export function capsule(token: JsonObject): string {
  return jwt.sign(token, app.jwtSecret, { expiresIn: "7d" });
}


/**
 * 当 @param verify 为 `true` 时：
 * - 若 token 签名无效时抛出 JsonWebTokenError
 * - 若 token 过期时抛出 TokenExpiredError
 *
 * 若 token 格式不正确，可以抛出 SyntaxError
 */
export function uncapsule(token: string, verify = true): JsonObject {
  const payload = verify ? jwt.verify(token, app.jwtSecret) : jwt.decode(token);
  if (typeof payload === "string") {
    return JSON.parse(payload);
  }
  return payload;
}
