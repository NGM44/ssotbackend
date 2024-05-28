import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../utils/response/custom-error/CustomError";
import { JwtPayload } from "../../types/jwtPayload";
import { createAccessToken } from "../../utils/createJwtToken";
import { User } from "db/mongodb";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email, deactivated: false });
    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    if (!checkIfPasswordMatch(password, user.password)) {
      const customError = new CustomError(404, "General", "invalid password");
      return next(customError);
    }
    const jwtPayload: JwtPayload = {
      id: String(user.id),
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role,
    };
    try {
      const token = createAccessToken(jwtPayload);
      const loginResponse = { token: `Bearer ${token}` };
      res.customSuccess(
        200,
        "Access Token Generated Successfully.",
        loginResponse
      );
    } catch (err) {
      const customError = new CustomError(
        500,
        "Raw",
        "OOPS!! \n Something went wrong while generating Token",
        ["OOPS! Something went wrong \n Try Once Again"],
        err
      );
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

const checkIfPasswordMatch = (
  unencryptedPassword: string,
  password: string
) => {
  return bcrypt.compareSync(unencryptedPassword, password);
};
