import mongoose from "mongoose";
import {
  IClient,
  IDevice,
  IUser,
  IWeatherData,
  ERole,
  EStatus,
} from "types/mongodb";
import { ulid } from "ulid";

const { Schema } = mongoose;

const roles = [ERole.ADMIN, ERole.USER];
const statuses = [
  EStatus.REGISTERED,
  EStatus.CONNECTED,
  EStatus.ACTIVATED,
  EStatus.DEACTIVATED,
  EStatus.BLOCKED,
  EStatus.UNREGISTERED,
  EStatus.TERMINATED,
];

const userSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    name: { type: String, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    deactivated: { type: Boolean, default: false },
    role: { type: String, enum: roles, required: true },
    clientId: { type: String, ref: "Client" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

const clientSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    name: { type: String, unique: true },
    logo: { type: String },
    address: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    website: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

const deviceSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    name: { type: String, required: true },
    identifier: { type: String, required: true },
    status: { type: String, enum: statuses, required: true },
    clientId: { type: String, ref: "Client" },
    modelType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

const userDeviceMappingSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    userId: { type: String, ref: "User", required: true },
    deviceId: { type: String, ref: "Device", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

userDeviceMappingSchema.index({ deviceId: 1, userId: 1 }, { unique: true });

const weatherDataSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    deviceId: { type: String, ref: "Device", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    timeseries: {
      timeField: "timestamp",
      granularity: "seconds",
    },
  },
);
const User = mongoose.model<IUser>("User", userSchema);
const Client = mongoose.model<IClient>("Client", clientSchema);
const Device = mongoose.model<IDevice>("Device", deviceSchema);
const UserDeviceMapping = mongoose.model(
  "UserDeviceMapping",
  userDeviceMappingSchema,
);
const WeatherData = mongoose.model<IWeatherData>(
  "WeatherData",
  weatherDataSchema,
);

export { Client, Device, User, UserDeviceMapping, WeatherData };
