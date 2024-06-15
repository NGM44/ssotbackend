import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Device, User } from "db/mongodb";
import { IDevice, IUser } from "types/mongodb";
import { JwtUserPayload, JwtDevicePayload } from "../types/jwtPayload";
import { CustomError } from "./response/custom-error/CustomError";

export const createAccessToken = (payload: JwtUserPayload): string => jwt.sign(payload, process.env.JWT_USER_SECRET_KEY as string, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
    algorithm: "HS512",
  });

export const createDeviceAccessToken = (payload: JwtDevicePayload): string => jwt.sign(payload, process.env.JWT_DEVICE_SECRET_KEY as string, {
    algorithm: "HS512",
  });

export const checkJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.get("AccessToken");
  if (!accessToken) {
    const customError = new CustomError(
      400,
      "General",
      "AccessToken header not provided",
    );
    return next(customError);
  }
  const token = accessToken.split(" ")[1];
  try {
    const jwtPayload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtUserPayload;
    req.jwtPayload = jwtPayload;
    const userDetails: IUser | null = await User.findOne({
      where: {
        _id: jwtPayload.id,
      },
    });
    if (!userDetails) {
      const customError = new CustomError(
        401,
        "Raw",
        "JWT error",
        null,
        "No User with the ID found",
      );
      return next(customError);
    } else {
      req.user = userDetails;
    }
  } catch (err) {
    const customError = new CustomError(401, "Raw", "JWT error", null, err);
    return next(customError);
  }
  return next();
};

export const checkDeviceJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.get("AccessToken");
  if (!accessToken) {
    const customError = new CustomError(
      400,
      "General",
      "AccessToken header not provided",
    );
    return next(customError);
  }
  const token = accessToken.split(" ")[1];
  try {
    const jwtPayload = jwt.verify(
      token,
      process.env.JWT_DEVICE_SECRET_KEY as string,
    ) as JwtDevicePayload;
    req.jwtPayload = jwtPayload;
    const device: IDevice | null = await Device.findOne({
      where: {
        _id: jwtPayload.id,
      },
    });
    if (!device) {
      const customError = new CustomError(
        401,
        "Raw",
        "JWT error",
        null,
        "No Device with the ID found",
      );
      return next(customError);
    } else {
      req.device = device;
    }
  } catch (err) {
    const customError = new CustomError(401, "Raw", "JWT error", null, err);
    return next(customError);
  }
  return next();
};
