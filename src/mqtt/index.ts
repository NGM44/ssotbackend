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
          };
          await WeatherData.create(data);
      }
  }, { noAck: true });
};