import { Document } from "mongoose";

export interface IWeatherData extends Document {
  id: string;
  temperature: number;
  humidity: number;
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
  users: IUserDto[],
  devices: IDeviceDto[]
}

export interface IUserDto extends Omit<IUser, keyof Document>{

}

export interface IDeviceDto extends Omit<IDevice, keyof Document> {
}

export interface IDevice extends Document {
  id: string;
  name: string;
  identifier: string;
  status: string;
  modelType: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}
