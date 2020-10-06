import express from "express";
import { validationResult } from "express-validator";
import * as HTTP_STATUS from "http-status-codes";
import cors from "cors";


export const CorsHandler: express.Handler = cors();

export const ArgumentValidationResultHandler: express.Handler = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send(errors);
    res.end();
  } else {
    next();
  }
};
