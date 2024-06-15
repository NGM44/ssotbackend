import mongoose from "mongoose";
import { IDevice, IUser, IWeatherData, Role, Status } from "types/mongodb";

const { Schema } = mongoose;

const roles = [Role.ADMIN, Role.USER];
const statuses = [
  Status.REGISTERED,
  Status.CONNECTED,
  Status.ACTIVATED,
  Status.DEACTIVATED,
  Status.BLOCKED,
  Status.UNREGISTERED,
  Status.TERMINATED,
];

const userSchema = new Schema(
  {
    name: { type: String, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    deactivated: { type: Boolean, default: false },
    role: { type: String, enum: roles, required: true },
    devices: [{ type: Schema.Types.ObjectId, ref: "UserDeviceMapping" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

const deviceSchema = new Schema(
  {
    name: { type: String, required: true },
    identifier: { type: String, required: true },
    status: { type: String, enum: statuses, required: true },
    modelType: { type: String, required: true },
    userDevices: [{ type: Schema.Types.ObjectId, ref: "UserDeviceMapping" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

const userDeviceMappingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    isDefault: { type: Boolean, default: false },
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
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
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
const Device = mongoose.model<IDevice>("Device", deviceSchema);
const UserDeviceMapping = mongoose.model(
  "UserDeviceMapping",
  userDeviceMappingSchema,
);
const WeatherData = mongoose.model<IWeatherData>(
  "WeatherData",
  weatherDataSchema,
);

export { Device, User, UserDeviceMapping, WeatherData };
