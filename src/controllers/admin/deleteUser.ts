import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../utils/response/custom-error/CustomError";
import { JwtPayload } from "../../types/jwtPayload";
import { createAccessToken } from "../../utils/createJwtToken";
import db from "db/ssotdb";

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.query.email?.toString();
  const userName = req.query.userName?.toString();
  try {
    if (!email && !userName) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const user = await db.user.findFirst({
      where: {
        OR: [{ email }, { name: userName }],
      },
    });
    const deletedUser = await db.user.delete({
      where: {
        id: user?.id,
      },
    });

    res.customSuccess(200, "User Deleted Successfully.", deletedUser);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const blockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.query.email?.toString();
  const userName = req.query.userName?.toString();
  const block = req.query.block === "false" ? false : true;
  try {
    if (!email && !userName) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const user = await db.user.findFirst({
      where: {
        OR:[
            {
                email,
              },
            {
                name: userName,
              },
        ]
      }
    });
    const blockeddUser = await db.user.update({
      where: {
        id: user?.id,
      },
      data: {
        blocked: block,
      },
    });

    res.customSuccess(200, "User Blocked Successfully.", blockeddUser);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
