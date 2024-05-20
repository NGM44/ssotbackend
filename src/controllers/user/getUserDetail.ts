import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../utils/response/custom-error/CustomError";
import db from "db/ssotdb";
import { Prisma } from "@prisma/client";

export const getuserDetails  = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

  }