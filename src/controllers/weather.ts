import { Device, WeatherData } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { EStatus } from "types/mongodb";
import { ulid } from "ulid";
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
        id: ulid(),
        timestamp: new Date(),
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        deviceId: req.device.id,
      };
      await WeatherData.create(data);
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
    const deviceId = req.params.id;
    const endDate = new Date(req.params.to);
    const startDate = new Date(req.params.from)
    const allData = await WeatherData.find(
          { timestamp: { $gte: startDate, $lte: endDate }, deviceId },
          {timestamp:1, temperature: 1, humidity:1 , _id: 0}
        ).lean();
    const dataToSend = allData.map((d) => ({
      temperature: parseFloat(d.temperature.toFixed(2)),
      humidity: parseFloat(d.humidity.toFixed(2)),
      dateString:
        d.timestamp.toDateString() +
        " " +
        d.timestamp.toTimeString().split(" ")[0],
    })); 
    return res.customSuccess(200, "Fetched Successfully", dataToSend);
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
    const oldDate = new Date();
    const endDate = new Date();
    oldDate.setDate(oldDate.getDate() - 90);
    const deviceId = ulid();
    await Device.create({id:deviceId , name: "Model 123", modelType: "Mobile", identifier: ulid(),clientId: null, status: EStatus.CONNECTED });
    const data = [];
    const currentDate = new Date(oldDate);
    while (currentDate < endDate) {
      data.push({
        timestamp: new Date(currentDate),
        temperature: Math.random() * 15 + 10,
        humidity: Math.random() * 30 + 40,
        deviceId,
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
