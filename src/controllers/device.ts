import { Device, UserDeviceMapping } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { Status } from "types/mongodb";
import logger from "utils/logger";
import { CustomError } from "utils/response/custom-error/CustomError";

export const registerDevice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { identifier, modelType } = req.body;
    //validate if identifier already exists
    const device = await Device.create({
      modelType,
      identifier,
      name: identifier,
      status: Status.REGISTERED,
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

// export const getRegisteredDeviceDetails = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const identifier = req.query.identifier as string;
//     const device: IDevice | null = await Device.findOne({ identifier });
//     if (!device) {
//       logger.error("No device found , please register");
//       const customError = new CustomError(
//         400,
//         "Raw",
//         "No device found , please register",
//         null,
//         "No device found , please register"
//       );
//       return next(customError);
//     } else {
//       return res.customSuccess(200, "Device fetched successfully", {
//         device,
//       });
//     }
//   } catch (err) {
//     const customError = new CustomError(
//       400,
//       "Raw",
//       "Cannot register device",
//       null,
//       err
//     );
//     return next(customError);
//   }
// };

export const connectDeviceWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const deviceId = req.body.deviceId;
    await UserDeviceMapping.create({ deviceId, userId, isDefault: true });
    await Device.updateOne({ deviceId }, { status: Status.CONNECTED });
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

// export const getConnectedDeviceDetails = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const identifier = req.query.identifier;
//     const device: IDevice | null = await Device.findOne({ identifier });
//     if (!device) {
//       logger.error("No device found , please register");
//       const customError = new CustomError(
//         400,
//         "Raw",
//         "No device found , please register",
//         null,
//         "No device found , please register"
//       );
//       return next(customError);
//     }
//     const jwtPayload: JwtDevicePayload = {
//       id: device.id,
//       status: device.status,
//     };
//     const token = createDeviceAccessToken(jwtPayload);
//     return res.customSuccess(200, "Access Token Generated Successfully.", { token });
//   } catch (err) {
//     const customError = new CustomError(
//       400,
//       "Raw",
//       "Cannot connect device",
//       null,
//       err
//     );
//     return next(customError);
//   }
// };

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stateToBeUpdated = req.body.state as Status;
    const deviceId = req.body.deviceId;
    // validate if stateToBeUpdated is valid for current device state.
    await Device.findOneAndUpdate({ deviceId }, { status: stateToBeUpdated });
    if (stateToBeUpdated === Status.UNREGISTERED) {
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
    const devices = await Device.find();
    return res.customSuccess(200, "Devices Fetched Successfully.", devices);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};
