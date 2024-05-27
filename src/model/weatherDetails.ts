import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherData extends Document {
  temperature: number;
  humidity: number;
  timestamp: Date;
}

const WeatherDataSchema: Schema = new Schema(
  {
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timeseries: {
      timeField: "timestamp",
      granularity: "seconds",
    },
  }
);

export const WeatherData = mongoose.model<IWeatherData>('WeatherData', WeatherDataSchema);