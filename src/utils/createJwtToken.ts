import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "../types/jwtPayload";
import jwt from 'jsonwebtoken';
import { isUndefined } from "lodash";
import { CustomError } from "./response/custom-error/CustomError";

export const createAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
        algorithm: "HS512"
    });
};

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    const key = req.get("apiKey") || req?.query?.apiKey;
    if (!isUndefined(key) && key === process.env.SELF_API_KEY) {
      return next();
    }
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const customError = new CustomError(
        400,
        "General",
        "Authorization header not provided"
      );
      return next(customError);
    }
    const token = authHeader.split(" ")[1];
    let jwtPayload: JwtPayload;
    try {
      jwtPayload = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;
      req.jwtPayload = jwtPayload;
      req.user = jwtPayload;
    } catch (err) {
      const customError = new CustomError(401, "Raw", "JWT error", null, err);
      return next(customError);
    }
    return next();
  };