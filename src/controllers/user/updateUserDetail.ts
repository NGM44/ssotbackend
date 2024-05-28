import { NextFunction, Request, Response } from "express";

export const getuserDetails  = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
const arr = [1,2,4,5];
  arr.reduce((a, b) => {
    console.log(a,b);
    return a + b;
  })
  }