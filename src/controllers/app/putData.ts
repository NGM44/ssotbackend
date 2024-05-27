import { NextFunction, Request, Response } from "express";
import { WeatherData } from "model/weatherDetails";
import { CustomError } from "../../utils/response/custom-error/CustomError";

export const postData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const oldDate = new Date("2024-01-01");
    const data: any[] = [];
    const endDate = new Date(oldDate);
    endDate.setDate(endDate.getDate() + 90);
    let currentDate = new Date(oldDate);
    while (currentDate < endDate) {
      data.push({
        timestamp: new Date(currentDate),
        temperature: Math.random() * 15 + 10,
        humidity: Math.random() * 30 + 40,
      });
      currentDate.setSeconds(currentDate.getSeconds() + 10);
    }
    await WeatherData.insertMany(data);
    res.customSuccess(200, "Created Successfully");
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
