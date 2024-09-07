import { Client, Device, User, UserDeviceMapping } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { EStatus, IClient, IUser } from "types/mongodb";
import { ulid } from "ulid";
import logger from "utils/logger";
import { CustomError } from "utils/response/custom-error/CustomError";

export const registerDevice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, identifier, modelType, location } = req.body;
    const existingDevice = await Device.findOne({ identifier }).lean();
    if (existingDevice) {
      const customError = new CustomError(
        500,
        "General",
        "Device already exists"
      );
      return next(customError);
    }
    const device = await Device.create({
      id: ulid(),
      modelType,
      identifier,
      location: location || "",
      name: name || identifier,
      clientId: null,
      status: EStatus.REGISTERED,
    });
    return res.customSuccess(200, "Device Registered successfully", device.id);
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot register device",
      null,
      err
    );
    return next(customError);
  }
};

export const connectDeviceWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const deviceId = req.body.deviceId;
    const clientId = req.body.clientId;
    if (!userId) {
      const customError = new CustomError(500, "General", "User not found");
      return next(customError);
    }
    if (!deviceId) {
      const customError = new CustomError(500, "General", "Device not found");
      return next(customError);
    }
    if (!clientId) {
      const customError = new CustomError(500, "General", "Client not found");
      return next(customError);
    }
    await UserDeviceMapping.create({ id: ulid(), deviceId, userId });
    await Device.updateOne({ deviceId }, { status: EStatus.CONNECTED });
    return res.customSuccess(200, "Device connected successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot connect device",
      null,
      err
    );
    return next(customError);
  }
};
export const connectDeviceWithClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deviceId = req.body.deviceId;
    const name = req.body.name;
    const modelType = req.body.modelType;
    const clientId = req.body.clientId;
    const location = req.body.location;
    if (!deviceId) {
      const customError = new CustomError(500, "General", "Device not found");
      return next(customError);
    }
    if (!clientId) {
      const customError = new CustomError(500, "General", "Client not found");
      return next(customError);
    }
    await Device.updateOne(
      { id: deviceId },
      { status: EStatus.CONNECTED, name, modelType, clientId , location }
    );
    return res.customSuccess(200, "Device connected successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot connect device",
      null,
      err
    );
    return next(customError);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stateToBeUpdated = req.body.state as EStatus;
    const deviceId = req.body.deviceId;
    // validate if stateToBeUpdated is valid for current device state.
    await Device.findOneAndUpdate(
      { id: deviceId },
      { status: stateToBeUpdated }
    ).lean();
    if (stateToBeUpdated === EStatus.UNREGISTERED) {
      await UserDeviceMapping.deleteMany({ deviceId });
    }
    return res.customSuccess(200, "Device status updated Successfully.");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot connect device",
      null,
      err
    );
    return next(customError);
  }
};

export const getAllDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const devices = await Device.find().lean();
    const devicesToBeSent = devices.map((device) => ({
      id: device.id,
      clientId: device.clientId,
      createdAt: device.createdAt,
      identifier: device.identifier,
      modelType: device.modelType,
      name: device.name,
      location: device.location,
      status: device.status,
      updatedAt: device.updatedAt,
    }));
    return res.customSuccess(
      200,
      "Devices Fetched Successfully.",
      devicesToBeSent
    );
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const getUserDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      const customError = new CustomError(500, "General", "User not found");
      return next(customError);
    }
    // const user: IUser | null = await User.findById({userId: user.id});
    const deviceIds = (
      await UserDeviceMapping.find({ userId: user.id }).lean()
    ).map((mapping) => mapping.deviceId);
    const devices = await Device.find({ id: { $in: deviceIds } }).lean();
    const client: IClient | null = await Client.findOne({
      id: user.clientId,
    }).lean();
    
    const devicesToBeSent = devices.map((device) => ({
      id: device.id,
      clientId: device.clientId,
      createdAt: device.createdAt,
      identifier: device.identifier,
      modelType: device.modelType,
      location: device.location,
      name: device.name,
      status: device.status,
      updatedAt: device.updatedAt,
    }));
    if (!client) {
      return res.customSuccess(200, "Devices Fetched Successfully.", {
        email: user.email,
        id: user.id,
        name: user.name,
        clientId: user.clientId,
        role: user.role,
        devices: devicesToBeSent,
      });
    }
    return res.customSuccess(200, "Devices Fetched Successfully.", {
      email: user.email,
      id: user.id,
      name: user.name,
      clientId: user.clientId,
      client: {
        id: client.id,
        name: client.name,
        logo: client.logo,
        address: client.address,
        email: client.email,
        phone: client.phone,
        website: client.website,
      },
      role: user.role,
      devices: devicesToBeSent,
    });
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
