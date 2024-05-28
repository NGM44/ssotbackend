export interface MWeatherData extends Document {
  temperature: number;
  humidity: number;
  timestamp: Date;
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  COMPANY = "COMPANY",
}

export interface MUser extends Document {
  name: string;
  email: string;
  password: string;
  deactivated: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
