import { WeatherData } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { IWeatherData } from "types/mongodb";
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
    const metric = req.params.metric;

    // Define the valid metrics to select from
    const validMetrics:{ [key in keyof IWeatherData]?: 1 } = {
      temperature: 1,
      humidity: 1,
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
    };

    // Check if the requested metric is valid
    if (!validMetrics.hasOwnProperty(metric)) {
      return res.status(400).json({ message: "Invalid metric" });
    }

    // Dynamically select only the requested metric along with timestamp
    const projection = {
      timestamp: 1,
      [metric]: 1,
      _id: 0, // exclude _id
    };

    const allData: IWeatherData[] = await WeatherData.find(
      { timestamp: { $gte: startDate, $lte: endDate }, deviceId },
      projection,
    ).lean();

    const dataToSend = allData.map((d) => ({
      [metric]: parseFloat((d as any)[metric]?.toFixed(2)),
      dateString: `${d.timestamp.toDateString()} ${d.timestamp.toTimeString().split(" ")[0]}`,
    }));

    return res.customSuccess(200, "Fetched Successfully", dataToSend);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};


export const getLatestData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deviceId = req.params.id;
    const latestData = await WeatherData.findOne(
      { deviceId },
      {
        timestamp: 1,
        temperature: 1,
        humidity: 1,
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
      }
    )
      .sort({ timestamp: -1 })
      .lean();

    // Format the latest data
    const dataToSend =  latestData && {
      temperature: parseFloat(latestData.temperature.toFixed(2)),
      humidity: parseFloat(latestData.humidity.toFixed(2)),
      pressure: parseFloat(latestData.pressure.toFixed(2)),
      co2: parseFloat(latestData.co2.toFixed(2)),
      vocs: parseFloat(latestData.vocs.toFixed(2)),
      light: parseFloat(latestData.light.toFixed(2)),
      noise: parseFloat(latestData.noise.toFixed(2)),
      pm1: parseFloat(latestData.pm1.toFixed(2)),
      pm25: parseFloat(latestData.pm25.toFixed(2)),
      pm4: parseFloat(latestData.pm4.toFixed(2)),
      pm10: parseFloat(latestData.pm10.toFixed(2)),
      aiq: parseFloat(latestData.aiq.toFixed(2)),
      gas1: parseFloat(latestData.gas1.toFixed(2)),
      gas2: parseFloat(latestData.gas2.toFixed(2)),
      gas3: parseFloat(latestData.gas3.toFixed(2)),
      gas4: parseFloat(latestData.gas4.toFixed(2)),
      gas5: parseFloat(latestData.gas5.toFixed(2)),
      gas6: parseFloat(latestData.gas6.toFixed(2)),
      dateString: `${latestData.timestamp.toDateString()} ${latestData.timestamp.toTimeString().split(" ")[0]}`
    };

    return res.customSuccess(200, "Fetched Successfully", dataToSend);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error fetching data", null, err);
    return next(customError);
  }
};


export const createDataFromPostman = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const endDate = new Date(req.body.to);
    const oldDate = new Date(req.body.from);
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
    console.log("Creating data");
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
