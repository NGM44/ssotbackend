import { Device, WeatherData } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { IWeatherData } from "types/mongodb";
import { reportGenerator } from "utils/report";
import { CustomError } from "utils/response/custom-error/CustomError";
import { wss } from "websocket";

export const postData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.body.temperature && req.body.humidity && req.device) {
      const dataToSend = {
        temperature: req.body.temperature,
        humidity: req.body.humidity,
      };
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(dataToSend));
      });
      const data = {
        timestamp: new Date(),
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        deviceId: req.device.id,
      };
      WeatherData.create(data);
    }
    return res.customSuccess(200, "Created Successfully");
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const getData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data: IWeatherData[] = await WeatherData.find(
      { timestamp: { $lt: new Date(), $gt: new Date("2024-06-01") } },
      { timestamp: 1, humidity: 1, temperature: 1, _id: 0 },
    );
    return res.customSuccess(200, "Fetched Successfully", data);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const createDataFromPostman = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const oldDate = new Date("2024-04-01");
    const endDate = new Date(oldDate);
    endDate.setDate(endDate.getDate() + 90);
    const device = await Device.create({ model: "Model 123", type: "Mobile" });
    const data = [];
    const currentDate = new Date(oldDate);
    while (currentDate < endDate) {
      data.push({
        timestamp: new Date(currentDate),
        temperature: Math.random() * 15 + 10,
        humidity: Math.random() * 30 + 40,
        deviceId: device.id,
      });
      currentDate.setSeconds(currentDate.getSeconds() + 10);
    }
    await WeatherData.insertMany(data);
    return res.customSuccess(200, "Created Successfully");
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const generateReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const json = req.body;
    const base64File = await reportGenerator(json);
    return res.customSuccess(200, "success", base64File);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
