import { User } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../utils/response/custom-error/CustomError";

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
    const user = await User.findOne({
      $or: [{ email }, { name: userName }],
    });
    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const deletedUser = await User.findByIdAndDelete(user._id);
    res.customSuccess(200, "User Deleted Successfully.", deletedUser);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const deactiveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.query.email?.toString();
  const userName = req.query.userName?.toString();
  const deactivated = req.query.block === "false" ? false : true;
  try {
    if (!email && !userName) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const user = await User.findOne({
      $or: [{ email }, { name: userName }]
    });
  
    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
  
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { deactivated },
      { new: true }
    );
    if (!updatedUser) {
      const customError = new CustomError(500, "General", "Failed to update user");
      return next(customError);
    }
    res.customSuccess(200, "User Deactivated Successfully.", updatedUser);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
