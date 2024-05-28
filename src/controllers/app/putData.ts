import { Device, WeatherData } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../utils/response/custom-error/CustomError";

export const postData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const oldDate = new Date("2024-01-01");
    const endDate = new Date(oldDate);
    endDate.setDate(endDate.getDate() + 90);
    const device = await Device.create({ model: "Model 123", type: "Mobile" });
    const data = [];
    let currentDate = new Date(oldDate);
    while (currentDate < endDate) {
      data.push({
        timestamp: new Date(currentDate),
        temperature: Math.random() * 15 + 10,
        humidity: Math.random() * 30 + 40,
        deviceId: device.id,
      })
      currentDate.setSeconds(currentDate.getSeconds() + 10);
    }
    await WeatherData.insertMany(data);
    res.customSuccess(200, "Created Successfully");
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
