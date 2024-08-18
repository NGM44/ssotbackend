import { client, wss } from "config";
import { WeatherData } from "db/mongodb";
import {NextFunction, Request,Response } from "express";
import { ulid } from "ulid";
import { CustomError } from "utils/response/custom-error/CustomError";


export const publishWeatherData = async (req: Request, res: Response, next: NextFunction) => {
  const deviceId = req.device?.id;
  const topic = `weather_data/${deviceId}`;
  const weatherData = {
    deviceId,
    temperature: req.body.temperature,
    humidity: req.body.humidity,
    pressure: req.body.pressure,
    co2: req.body.co2,
    vocs: req.body.vocs,
    light: req.body.light,
    noise: req.body.noise,
    pm1: req.body.pm1,
    pm25: req.body.pm25,
    pm4: req.body.pm4,
    pm10: req.body.pm10,
    aiq: req.body.aiq,
    gas1: req.body.gas1,
    gas2: req.body.gas2,
    gas3: req.body.gas3,
    gas4: req.body.gas4,
    gas5: req.body.gas5,
    gas6: req.body.gas6,
    dateString: `${new Date().toDateString()} ${new Date().toTimeString().split(" ")[0]}`,
  };
  if (client.connected) {
    client.publish(topic, JSON.stringify(weatherData), (err) => {
      if (err) {
        console.error('Failed to publish message:', err);
        return next(new CustomError(
          500,
          "Raw",
          "MQTT publish error",
          null,
          err,
        ));
      }
      console.log(" [x] Sent weather data");
    });
  } else {
    console.error('MQTT client not connected');
    return next(new CustomError(
      500,
      "Raw",
      "MQTT client not connected",
      null,
    ));
  }
  return res.customSuccess(200, 'Message sent successfully');
};


export const consumeWeatherData = async () => {
  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('weather_data/#', (err) => {
      if (err) {
        console.error('Failed to subscribe:', err);
      } else {
        console.log('Subscribed to weather_data/#');
      }
    });
  });
  client.on('message', async (topic, message) => {
    try {
      if (topic.startsWith('weather_data/')) {
      const weatherData = JSON.parse(message.toString());
      console.log(`[x] Received data from device ${weatherData.deviceId}:`, weatherData);
      console.log(wss);
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(weatherData));
      });
      const data = {
        id: ulid(),
        timestamp: new Date(),
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        deviceId: weatherData.deviceId,
        pressure: weatherData.pressure,
        co2: weatherData.co2,
        vocs: weatherData.vocs,
        light: weatherData.light,
        noise: weatherData.noise,
        pm1: weatherData.pm1,
        pm25: weatherData.pm25,
        pm4: weatherData.pm4,
        pm10: weatherData.pm10,
        aiq: weatherData.aiq,
        gas1: weatherData.gas1,
        gas2: weatherData.gas2,
        gas3: weatherData.gas3,
        gas4: weatherData.gas4,
        gas5: weatherData.gas5,
        gas6: weatherData.gas6,
      };
      await WeatherData.create(data);
    } }catch (err) {
      console.error('Error processing message:', err);
    }
  });
  client.on('error', (err) => {
    console.error('MQTT Error:', err);
  });
};