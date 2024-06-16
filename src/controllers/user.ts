import bcrypt from "bcryptjs";
import { Device, User, WeatherData } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { JwtUserPayload } from "types/jwtPayload";
import { createAccessToken } from "utils/createJwtToken";
import { IUser, Role } from "types/mongodb";

import { SendEmailDto, emailTemplatesFolder, sendEmail } from "utils/email";
import { readFileSync } from "fs";
import logger from "utils/logger";
import { CustomError } from "../utils/response/custom-error/CustomError";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, role, name } = req.body;
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });
  if (existingUser) {
    const customError = new CustomError(409, "General", "User already exists");
    return next(customError);
  }
  const userRole = role ?? Role.USER;

  const password = generateRandomPassword();
  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const data = {
      name,
      email,
      password: hashedPassword,
      role: userRole,
    };
    const newUser = await User.create(data);
    const jwtPayload: JwtUserPayload = {
      id: String(newUser.id),
      email: newUser.email,
      role: newUser.role,
    };
    const token = createAccessToken(jwtPayload);
    return res.customSuccess(200, "User successfully created.", {
      ...newUser,
      token,
    });
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      `User '${email}' can't be created`,
      null,
      err,
    );
    return next(customError);
  }
};

export const generateCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });
  if (!existingUser) {
    const customError = new CustomError(400, "General", "User doesn't exist");
    return next(customError);
  }
  const password = generateRandomPassword();
  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    await User.findByIdAndUpdate(existingUser._id, {
      password: hashedPassword,
    });
    let html = readFileSync(
      `${emailTemplatesFolder}credentials-generated.html`,
    ).toString();
    html = html.replace("#email#", existingUser.email);
    html = html.replace("#password#", password);
    const sendEmailDto: SendEmailDto = {
      from: "sahilymenda@gmail.com",
      to: existingUser.email,
      html,
      subject: "Credentails Generated",
    };
    await sendEmail(sendEmailDto);
    return res.customSuccess(200, "Generated Credentials successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      `User '${email}' can't be created`,
      null,
      err,
    );
    return next(customError);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = req.query.email?.toString();
  const userName = req.query.userName?.toString();
  try {
    if (!email && !userName) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const user = await User.findOne({
      $or: [{ email }, { name: userName }],
    });
    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const deletedUser = await User.findByIdAndDelete(user._id);
    return res.customSuccess(200, "User Deleted Successfully.", deletedUser);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await User.find();
    return res.customSuccess(200, "Users Fetched Successfully.", users);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const deactiveUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const email = req.query.email?.toString();
  const userName = req.query.userName?.toString();
  const deactivated = req.query.block !== "false";
  try {
    if (!email && !userName) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const user = await User.findOne({
      $or: [{ email }, { name: userName }],
    });

    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }

    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      user._id,
      { deactivated },
      { new: true },
    );
    if (!updatedUser) {
      const customError = new CustomError(
        500,
        "General",
        "Failed to update user",
      );
      return next(customError);
    }
    return res.customSuccess(
      200,
      "User Deactivated Successfully.",
      updatedUser,
    );
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, deactivated: false });
    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    if (!checkIfPasswordMatch(password, user.password)) {
      const customError = new CustomError(404, "General", "invalid password");
      return next(customError);
    }
    const jwtPayload: JwtUserPayload = {
      id: String(user.id),
      email: user.email,
      role: user.role,
    };
    try {
      const token = createAccessToken(jwtPayload);
      const loginResponse = { token: `Bearer ${token}` };
      return res.customSuccess(
        200,
        "Access Token Generated Successfully.",
        loginResponse,
      );
    } catch (err) {
      const customError = new CustomError(
        500,
        "Raw",
        "OOPS!! \n Something went wrong while generating Token",
        ["OOPS! Something went wrong \n Try Once Again"],
        err,
      );
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { currentPassword, passwordNew } = req.body;
  const userId = req.user?.id || "";
  logger.info(`User with user id ${userId} is trying to change password`);
  try {
    const user = await User.findById(userId);
    if (!user) {
      const customError = new CustomError(404, "General", "Not Found", [
        "User not found!",
      ]);
      return next(customError);
    }
    if (currentPassword) {
      const currentPswdMatched = checkIfPasswordMatch(
        currentPassword,
        user.password,
      );

      if (!currentPswdMatched) {
        const customError = new CustomError(
          400,
          "General",
          "Incorrect old password",
          ["Incorrect old password"],
        );
        return next(customError);
      }
    }
    const changedPassword = bcrypt.hashSync(passwordNew, 8);
    try {
      await User.updateOne({ id: user.id }, { password: changedPassword });
      return res.customSuccess(200, "password successfully changed");
    } catch (error) {
      const customError = new CustomError(
        500,
        "Raw",
        "Password could not be updated",
        null,
        error,
      );
      return next(customError);
    }
  } catch (error) {
    const customError = new CustomError(
      500,
      "Raw",
      "Password could not be updated",
      null,
      error,
    );
    return next(customError);
  }
};

const checkIfPasswordMatch = (unencryptedPassword: string, password: string) =>
  bcrypt.compareSync(unencryptedPassword, password);

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8);
}
