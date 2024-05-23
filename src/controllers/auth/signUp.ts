import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import db from "db/ssotdb";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "types/jwtPayload";
import { ulid } from "ulid";
import { createAccessToken } from "utils/createJwtToken";
import { CustomError } from "../../utils/response/custom-error/CustomError";


export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userName, email, password, role } = req.body;
  const existingUser = await db.user.findFirst({
    where: {
      email,
    },
  });
  if (!userName) {
    const customError = new CustomError(
      409,
      "General",
      "User name is required"
    );
    return next(customError);
  }
  if (existingUser) {
    const customError = new CustomError(409, "General", "User already exists");
    return next(customError);
  }
  const userRole = role ?? Role.USER;
  if (userRole !== Role.ADMIN && userRole !== Role.COMPANY && userRole !== Role.USER) {
    const customError = new CustomError(403, "General", "Invalid Role");
    return next(customError);
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const id = ulid();
    console.log("ID",id);
    const data: Prisma.UserCreateInput = {
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: userName,
      email,
      password: hashedPassword,
      role: userRole,
    };
    console.log(data);
    const newUser = await db.user.create({
      data
    });
    const jwtPayload: JwtPayload = {
      id: String(newUser.id),
      name: newUser.name ?? "",
      email: newUser.email ?? "",
      role: newUser.role,
    };
    const token = createAccessToken(jwtPayload);
    res.customSuccess(200, "User successfully created.", { ...newUser, token });
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      `User '${email}' can't be created`,
      null,
      err
    );
    return next(customError);
  }
};

export const userNameAvailablity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userName = req.query.userName?.toString() ?? "";
  const regex = /\w+/;
  console.log(userName, regex.test(userName));
  if (!regex.test(userName)) {
    const customError = new CustomError(
      409,
      "General",
      "User Name Should Only Include Alphabets ,Number or underscore"
    );
    return next(customError);
  } else if (userName.length < 4) {
    const customError = new CustomError(
      409,
      "General",
      "User Name should consist minimum 4 characters"
    );
    return next(customError);
  }
  const userExist = await db.user.findFirst({
    where: {
      name: userName,
    },
  });
  if (userExist) {
    const customError = new CustomError(409, "General", "User Name Exists");
    return next(customError);
  }
  res.customSuccess(200, "User Name Available", userName);
};
