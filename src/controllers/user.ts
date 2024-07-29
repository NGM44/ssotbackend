import bcrypt from "bcryptjs";
import { User, UserDeviceMapping } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { JwtUserPayload } from "types/jwtPayload";
import { IUser, ERole } from "types/mongodb";
import {
  createAccessToken,
  createPasswordResetToken,
} from "utils/createJwtToken";
import fs, { readFileSync } from "fs";
import { SendEmailDto, emailTemplatesFolder, sendEmail } from "utils/email";
import logger from "utils/logger";
import { ulid } from "ulid";
import { CustomError } from "../utils/response/custom-error/CustomError";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, name, clientId } = req.body;
  const existingUser = await User.findOne({
    email,
  });
  if (existingUser) {
    const customError = new CustomError(409, "General", "User already exists");
    return next(customError);
  }
  if (!clientId) {
    const customError = new CustomError(
      409,
      "General",
      "Cannot create user without client ID",
    );
    return next(customError);
  }
  const password = generateRandomPassword();
  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const data = {
      id: ulid(),
      name,
      email,
      clientId,
      password: hashedPassword,
      role: ERole.USER,
    };
    await User.create(data);
    return res.customSuccess(200, "User successfully created.");
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

export const adminSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, name } = req.body;
  const existingUser = await User.findOne({
    email,
  });
  if (existingUser) {
    const customError = new CustomError(409, "General", "User already exists");
    return next(customError);
  }

  const password = generateRandomPassword();
  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const data = {
      id: ulid(),
      name,
      email,
      password: hashedPassword,
      role: ERole.ADMIN,
    };
    await User.create(data);
    return res.customSuccess(200, "User successfully created");
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
    email,
  });
  if (!existingUser) {
    const customError = new CustomError(400, "General", "User doesn't exist");
    return next(customError);
  }
  const password = generateRandomPassword();
  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    await User.findOneAndUpdate(
      { id: existingUser.id },
      {
        password: hashedPassword,
      },
    );
    let html = readFileSync(
      `${emailTemplatesFolder}/credentials-generated.html`,
    ).toString();
    html = html.replace("#email#", existingUser.email);
    html = html.replace("#name#", existingUser.name);
    html = html.replace("#password#", password);
    const sendEmailDto: SendEmailDto = {
      from: process.env.SENDGRID_FROM!,
      to: existingUser.email,
      html,
      subject: "Credentails Generated",
    };
    await sendEmail(sendEmailDto);
    return res.customSuccess(
      200,
      "Generated Credentials successfully",
      password,
    );
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
  const id = req.params.id;
  try {
    if (!id) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const user = await User.findOne({ id });
    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    await User.deleteOne({ id: user.id });
    await UserDeviceMapping.deleteMany({ userId: user.id });
    return res.customSuccess(200, "User Deleted Successfully.");
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
    const users: IUser[] = await User.find({
      id: 1,
      name: 1,
      _id: 0,
      email: 1,
      deactivated: 1,
      role: 1,
      clientId: 1,
      password: 0,
    }).lean();
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
  const deactivated = req.query.deactivated !== "false";
  try {
    if (!email) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const user = await User.findOne({ email });
    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }

    const updatedUser: IUser | null = await User.findOneAndUpdate(
      { id: user.id },
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
    const user: IUser | null = await User.findOne({
      email,
      deactivated: false,
    });
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
      const loginResponse = { id: jwtPayload.id, token: `Bearer ${token}` };
      return res.customSuccess(200, "Logged in successfully", loginResponse);
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
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id || "";
  logger.info(`User with user id ${userId} is trying to change password`);
  try {
    const user: IUser | null = await User.findById(userId);
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
    const changedPassword = bcrypt.hashSync(newPassword, 8);
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

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { newPassword } = req.body;
  const userId = req.user?.id || "";
  logger.info(`User with user id ${userId} is trying to reset password`);
  try {
    const user: IUser | null = await User.findOne({ id: userId });
    if (!user) {
      const customError = new CustomError(404, "General", "Not Found", [
        "User not found!",
      ]);
      return next(customError);
    }
    const changedPassword = bcrypt.hashSync(newPassword, 8);
    try {
      await User.updateOne({ id: user.id }, { password: changedPassword });
      //TODO: mail bhejna hai
      return res.customSuccess(
        200,
        "password successfully changed",
        changedPassword,
      );
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

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  try {
    const user: IUser | null = await User.findOne({
      email,
    });
    if (!user) {
      const customError = new CustomError(404, "General", "User not Found", [
        "User not found!",
      ]);
      return next(customError);
    }
    if (user?.deactivated) {
      const customError = new CustomError(
        404,
        "General",
        "Account has been Deactivated",
        ["Account has been Deactivated"],
      );
      return next(customError);
    }
    let link;
    if (user) {
      const token = createPasswordResetToken({
        email: user.email,
        id: user.id,
        role: user.role,
      });
      const employeeResetPasswordLink = `${process.env.APP_URL}/changePassword?token=${token}`;
      let html = fs
        .readFileSync(`${emailTemplatesFolder}/forgot-password.html`)
        .toString();
      html = html.replace("#email#", user.email);
      html = html.replace("#name#", user.name);
      html = html.replace("#ResetPasswordLink#", employeeResetPasswordLink);
      const sendEmailDto: SendEmailDto = {
        from: process.env.SENDGRID_FROM!,
        to: user.email,
        html,
        subject: "Reset Password",
      };
      link = employeeResetPasswordLink;
      // await sendEmail(sendEmailDto);
    }
    return res.customSuccess(
      200,
      "Reset Passsword link has been shared through mail",
      link,
    );
  } catch (error) {
    const customError = new CustomError(500, "Raw", "Error", null, error);
    return next(customError);
  }
};
