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
  pm25: number;
  pm4: number;
  pm10: number;
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

export interface IPreference extends Document {
  id: string;
  userId: string;
  preference: string;
}

export interface IWeatherDataRange extends Document {
  id: string;
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  pressureMin: number;
  pressureMax: number;
  co2Min: number;
  co2Max: number;
  vocsMin: number;
  vocsMax: number;
  lightMin: number;
  lightMax: number;
  noiseMin: number;
  noiseMax: number;
  pm1Min: number;
  pm1Max: number;
  pm25Min: number;
  pm25Max: number;
  pm4Min: number;
  pm4Max: number;
  pm10Min: number;
  pm10Max: number;
  aiqMin: number;
  aiqMax: number;
  gas1Min: number;
  gas1Max: number;
  gas2Min: number;
  gas2Max: number;
  gas3Min: number;
  gas3Max: number;
  gas4Min: number;
  gas4Max: number;
  gas5Min: number;
  gas5Max: number;
  gas6Min: number;
  gas6Max: number;
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

export interface IGasMapping extends Document {
  gas1: string;
  gas2: string;
  gas3: string;
  gas4: string;
  gas5: string;
  gas6: string;
  clientId: string;
}

export interface ISession extends Document {
  id: string;
  userId: string;
  jwt: string;
  isValid: boolean;
}
export interface IClient extends Document {
  id: string;
  name: string;
  logo: string;
  address: string;
  email: string;
  phone: string;
  showBanner: boolean;
  bannerLink: string;
  bannerMessage: string;
  website: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientDto extends Omit<IClient, keyof Document> {
  id: string;
  users: IUserDto[];
  devices: IDeviceDto[];
  gasMapping?: IGasMappingDto;
}

export interface IUserDto extends Omit<IUser, keyof Document> {
  id: string;
}

export interface IDeviceDto extends Omit<IDevice, keyof Document> {
  id: string;
}

export interface IGasMappingDto extends Omit<IGasMapping, keyof Document> {}

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

export interface INotification extends Document {
  id: string;
  userId: string;
  notification: string;
  createdAt: Date;
}
