import { WeatherData } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { generateWeatherReport } from "utils/report";
import { CustomError } from "utils/response/custom-error/CustomError";

export const getData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deviceId = req.params.id;
    const endDate = new Date(req.params.to);
    const startDate = new Date(req.params.from);
    const allData = await WeatherData.find(
      { timestamp: { $gte: startDate, $lte: endDate }, deviceId },
      { timestamp: 1, temperature: 1, humidity: 1, _id: 0 },
    ).lean();
    const dataToSend = allData.map((d) => ({
      temperature: parseFloat(d.temperature.toFixed(2)),
      humidity: parseFloat(d.humidity.toFixed(2)),
      dateString: `${d.timestamp.toDateString()} ${
        d.timestamp.toTimeString().split(" ")[0]
      }`,
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
    const deviceId = req.body.deviceId;
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
    const deviceId = req.body.deviceId;
    const endDate = new Date(req.body.to);
    const startDate = new Date(req.body.from);
    const allData = await WeatherData.find(
      { timestamp: { $gte: startDate, $lte: endDate }, deviceId },
      { timestamp: 1, temperature: 1, humidity: 1, _id: 0 },
    ).lean();
    const dataToSend = allData.map((d) => ({
      temperature: parseFloat(d.temperature.toFixed(2)),
      humidity: parseFloat(d.humidity.toFixed(2)),
      dateString: `${d.timestamp.toDateString()} ${
        d.timestamp.toTimeString().split(" ")[0]
      }`,
    }));
    const base64File = generateWeatherReport(dataToSend);
    return res.customSuccess(200, "success", base64File);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
