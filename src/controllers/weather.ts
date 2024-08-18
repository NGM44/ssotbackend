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
      {
        timestamp: 1, temperature: 1, humidity: 1,
        pressure: 1,
        co2: 1,
        vocs: 1,
        light: 1,
        noise: 1,
        pm1: 1,
        pm25: 1,
        pm4: 1,
        pm10: 1,
        aiq: 1,
        gas1: 1,
        gas2: 1,
        gas3: 1,
        gas4: 1,
        gas5: 1,
        gas6: 1,
        _id: 0
      },
    ).lean();
    const dataToSend = allData.map((d) => ({
      temperature: parseFloat(d.temperature.toFixed(2)),
      humidity: parseFloat(d.humidity.toFixed(2)),
      pressure: parseFloat(d.pressure.toFixed(2)),
      co2: parseFloat(d.co2.toFixed(2)),
      vocs: parseFloat(d.vocs.toFixed(2)),
      light: parseFloat(d.light.toFixed(2)),
      noise: parseFloat(d.noise.toFixed(2)),
      pm1: parseFloat(d.pm1.toFixed(2)),
      pm25: parseFloat(d.pm25.toFixed(2)),
      pm4: parseFloat(d.pm4.toFixed(2)),
      pm10: parseFloat(d.pm10.toFixed(2)),
      aiq: parseFloat(d.aiq.toFixed(2)),
      gas1: parseFloat(d.gas1.toFixed(2)),
      gas2: parseFloat(d.gas2.toFixed(2)),
      gas3: parseFloat(d.gas3.toFixed(2)),
      gas4: parseFloat(d.gas4.toFixed(2)),
      gas5: parseFloat(d.gas5.toFixed(2)),
      gas6: parseFloat(d.gas6.toFixed(2)),
      dateString: `${d.timestamp.toDateString()} ${d.timestamp.toTimeString().split(" ")[0]
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
        pressure: Math.random() * 34 + 11,
        co2: Math.random() * 34 + 11,
        vocs: Math.random() * 34 + 11,
        light: Math.random() * 34 + 11,
        noise: Math.random() * 34 + 11,
        pm1: Math.random() * 34 + 11,
        pm25: Math.random() * 34 + 11,
        pm4: Math.random() * 34 + 11,
        pm10: Math.random() * 34 + 11,
        aiq: Math.random() * 34 + 11,
        gas1: Math.random() * 34 + 11,
        gas2: Math.random() * 34 + 11,
        gas3: Math.random() * 34 + 11,
        gas4: Math.random() * 34 + 11,
        gas5: Math.random() * 34 + 11,
        gas6: Math.random() * 34 + 11,
        deviceId,
      });
      currentDate.setSeconds(currentDate.getSeconds() + 60);
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
      {
        timestamp: 1, temperature: 1, humidity: 1,
        pressure: 1,
        co2: 1,
        vocs: 1,
        light: 1,
        noise: 1,
        pm1: 1,
        pm25: 1,
        pm4: 1,
        pm10: 1,
        aiq: 1,
        gas1: 1,
        gas2: 1,
        gas3: 1,
        gas4: 1,
        gas5: 1,
        gas6: 1,
        _id: 0
      },
    ).lean();
    const dataToSend = allData.map((d) => ({
      temperature: parseFloat(d.temperature.toFixed(2)),
      humidity: parseFloat(d.humidity.toFixed(2)),
      pressure: parseFloat(d.pressure.toFixed(2)),
      co2: parseFloat(d.co2.toFixed(2)),
      vocs: parseFloat(d.vocs.toFixed(2)),
      light: parseFloat(d.light.toFixed(2)),
      noise: parseFloat(d.noise.toFixed(2)),
      pm1: parseFloat(d.pm1.toFixed(2)),
      pm25: parseFloat(d.pm25.toFixed(2)),
      pm4: parseFloat(d.pm4.toFixed(2)),
      pm10: parseFloat(d.pm10.toFixed(2)),
      aiq: parseFloat(d.aiq.toFixed(2)),
      gas1: parseFloat(d.gas1.toFixed(2)),
      gas2: parseFloat(d.gas2.toFixed(2)),
      gas3: parseFloat(d.gas3.toFixed(2)),
      gas4: parseFloat(d.gas4.toFixed(2)),
      gas5: parseFloat(d.gas5.toFixed(2)),
      gas6: parseFloat(d.gas6.toFixed(2)),
      dateString: `${d.timestamp.toDateString()} ${d.timestamp.toTimeString().split(" ")[0]
        }`,
    }));
    const base64File = generateWeatherReport(dataToSend);
    return res.customSuccess(200, "success", base64File);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
