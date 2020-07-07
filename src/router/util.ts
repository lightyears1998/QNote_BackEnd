import express from "express";
import { validationResult } from "express-validator";
import * as HTTP_STATUS from "http-status-codes";


export const CorsHandler: express.Handler = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin); // 设置允许来自哪里的跨域请求访问（req.headers.origin为当前访问来源的域名与端口）
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"); // 设置允许接收的请求类型
  res.header("Access-Control-Allow-Headers", "Content-Type,request-origin"); // 设置请求头中允许携带的参数
  res.header("Access-Control-Allow-Credentials", "true"); // 允许客户端携带证书式访问。保持跨域请求中的Cookie。注意：此处设true时，Access-Control-Allow-Origin的值不能为 '*'
  res.header("Access-control-max-age", "1000"); // 设置请求通过预检后多少时间内不再检验，减少预请求发送次数

  next();
};


export const ArgumentValidationResultHandler: express.Handler = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(errors);
    res.end();
  } else {
    next();
  }
};
