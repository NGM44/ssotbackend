import { Client } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import logger from "utils/logger";
import { CustomError } from "utils/response/custom-error/CustomError";

export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientData = req.body;
    const existingClient = await Client.findOne({name: clientData.name});
    if(existingClient){
      const customError = new CustomError(409, "General", "Client already exists");
      return next(customError);
    }
    await Client.create({
      clientData
    });
    logger.info("Client Created successfully");
    return res.customSuccess(200, "Client Created successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot create client",
      null,
      err,
    );
    return next(customError);
  }
};