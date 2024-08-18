import amqp from "amqplib";
import { WeatherData } from "db/mongodb";
import {Request,Response } from "express";
import { ulid } from "ulid";
import { wss } from "websocket";

export const publishWeatherData = async (req: Request, res: Response) => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const deviceId = req.device?.id;

  const exchange = 'weather_exchange';
  const routingKey = `weather_data.${deviceId}`;

  await channel.assertExchange(exchange, 'topic', { durable: true });

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
      dateString: `${new Date().toDateString()} ${
        new Date().toTimeString().split(" ")[0]
      }`,
  };

  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(weatherData)));
  console.log(" [x] Sent weather data");
  return res.customSuccess(200, 'Message sent successfully');
};

export const consumeWeatherData = async () => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'weather_exchange';
  const queue = 'weather_queue';

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, 'weather_data.*');

  channel.consume(queue, async (msg) => {
      if (msg) {
          const weatherData = JSON.parse(msg.content.toString());
          console.log(`[x] Received data from device ${weatherData.deviceId}:`, weatherData);
          wss.clients.forEach((client) => {
            client.send(JSON.stringify(weatherData));
          });
          const data = {
            id: ulid(),
            timestamp: new Date(),
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            deviceId:weatherData.deviceId,
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
      }
  }, { noAck: true });
};