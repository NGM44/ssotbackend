import { Document } from "mongoose";
export interface IWeatherData extends Document {
  temperature: number;
  humidity: number;
  timestamp: Date;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum Status {
  REGISTERED = "REGISTERED",
  CONNECTED = "CONNECTED",
  ACTIVATED = "ACTIVATED",
  DEACTIVATED = "DEACTIVATED",
  BLOCKED = "BLOCKED",
  UNREGISTERED = "UNREGISTERED",
  TERMINATED = "TERMINATED",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  deactivated: boolean;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDevice extends Document {
  name: string;
  identifier: string;
  status: string;
  modelType: string;
  createdAt: Date;
  updatedAt: Date;
}
