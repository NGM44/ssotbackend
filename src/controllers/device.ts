import { Device, UserDeviceMapping } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { EStatus } from "types/mongodb";
import { ulid } from "ulid";
import logger from "utils/logger";
import { CustomError } from "utils/response/custom-error/CustomError";

export const registerDevice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, identifier, modelType } = req.body;
    const existingDevice = await Device.findOne({ identifier }).lean();
    if (existingDevice) {
      const customError = new CustomError(
        409,
        "General",
        "Devuce already exists",
      );
      return next(customError);
    }
    const device = await Device.create({
      id: ulid(),
      modelType,
      identifier,
      name: name || identifier,
      clientId: null,
      status: EStatus.REGISTERED,
    });
    logger.info("Device Registered successfully");
    return res.customSuccess(200, "Device Registered successfully", device.id);
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot register device",
      null,
      err,
    );
    return next(customError);
  }
};

export const connectDeviceWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const deviceId = req.body.deviceId;
    const clientId = req.body.clientId;
    if (!userId) {
      const customError = new CustomError(409, "General", "User not found");
      return next(customError);
    }
    if (!deviceId) {
      const customError = new CustomError(409, "General", "Device not found");
      return next(customError);
    }
    if (!clientId) {
      const customError = new CustomError(409, "General", "Client not found");
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
      err,
    );
    return next(customError);
  }
};
export const connectDeviceWithClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deviceId = req.body.deviceId;
    const name = req.body.name;
    const modelType = req.body.modelType;
    const clientId = req.body.clientId;
    if (!deviceId) {
      const customError = new CustomError(409, "General", "Device not found");
      return next(customError);
    }
    if (!clientId) {
      const customError = new CustomError(409, "General", "Client not found");
      return next(customError);
    }
    await Device.updateOne(
      { id: deviceId },
      { status: EStatus.CONNECTED, name, modelType, clientId },
    );
    return res.customSuccess(200, "Device connected successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot connect device",
      null,
      err,
    );
    return next(customError);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stateToBeUpdated = req.body.state as EStatus;
    const deviceId = req.body.deviceId;
    // validate if stateToBeUpdated is valid for current device state.
    await Device.findOneAndUpdate(
      { id: deviceId },
      { status: stateToBeUpdated },
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
      err,
    );
    return next(customError);
  }
};

export const getAllDevices = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
      status: device.status,
      updatedAt: device.updatedAt,
    }));
    return res.customSuccess(
      200,
      "Devices Fetched Successfully.",
      devicesToBeSent,
    );
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const getUserDevices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if(!user){
      const customError = new CustomError(409, "General", "User not found");
      return next(customError);
    }
    const deviceIds = (await UserDeviceMapping.find({userId: user.id}).lean()).map(mapping => mapping.deviceId);
    const devices = await Device.find({ id: { $in: deviceIds},}).lean();
    const devicesToBeSent = devices.map((device) => ({
      id: device.id,
      clientId: device.clientId,
      createdAt: device.createdAt,
      identifier: device.identifier,
      modelType: device.modelType,
      name: device.name,
      status: device.status,
      updatedAt: device.updatedAt,
    }));
    return res.customSuccess(
      200,
      "Devices Fetched Successfully.",
      devicesToBeSent,
    );
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
