import { Document } from "mongoose";

export interface IWeatherData extends Document {
  id: string;
  temperature: number;
  humidity: number;
  pressure: number;
  co2: number;
  vocs: number;
  light: number;
  noise: number;
  pm1: number;
  pm25 : number;
  pm4 : number;
  pm10 : number;
  aiq: number;
  gas1: number;
  gas2: number;
  gas3: number;
  gas4: number;
  gas5: number;
  gas6: number;
  timestamp: Date;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ERole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum EStatus {
  REGISTERED = "REGISTERED",
  CONNECTED = "CONNECTED",
  ACTIVATED = "ACTIVATED",
  DEACTIVATED = "DEACTIVATED",
  BLOCKED = "BLOCKED",
  UNREGISTERED = "UNREGISTERED",
  TERMINATED = "TERMINATED",
}

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  deactivated: boolean;
  role: ERole;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClient extends Document {
  id: string;
  name: string;
  logo: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientDto extends Omit<IClient, keyof Document> {
  id: string;
  users: IUserDto[];
  devices: IDeviceDto[];
}

export interface IUserDto extends Omit<IUser, keyof Document> {
  id: string;
}

export interface IDeviceDto extends Omit<IDevice, keyof Document> {
  id: string;
}

export interface IDevice extends Document {
  id: string;
  name: string;
  identifier: string;
  location: string;
  status: string;
  modelType: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}
