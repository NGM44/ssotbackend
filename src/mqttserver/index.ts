import { client } from "config";
import { WeatherData } from "db/mongodb";
import { ulid } from "ulid";

export const consumeWeatherData = async () => {
  client.on('connect', () => {
    console.log('Connected to MQTT broker from consumer side');
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
      const deviceId = topic.split("/")[1];
      const weatherData = JSON.parse(message.toString());
      console.log(`[x] Received data from device ${deviceId}:`, weatherData);
      const data = {
        id: ulid(),
        timestamp: new Date(),
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        deviceId,
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
    console.error('MQTT Error from consumer side:', err);
  });
};