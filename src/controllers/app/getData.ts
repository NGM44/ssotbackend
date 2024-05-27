import { NextFunction, Request, Response } from "express";
import { IWeatherData, WeatherData } from "model/weatherDetails";
import { CustomError } from "../../utils/response/custom-error/CustomError";

export const getData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: IWeatherData[] = await WeatherData.find().limit(10000);
    res.customSuccess(200, "Fetched Successfully", data);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
