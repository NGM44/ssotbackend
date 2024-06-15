import bcrypt from "bcryptjs";
import { Device, User, UserDeviceMapping, WeatherData } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { JwtDevicePayload, JwtUserPayload } from "types/jwtPayload";
import {
  createAccessToken,
  createDeviceAccessToken,
} from "utils/createJwtToken";
import { CustomError } from "../utils/response/custom-error/CustomError";
import { IDevice, IUser, IWeatherData, Role, Status } from "types/mongodb";

import WebSocket from "ws";
import logger from "utils/logger";
import { SendEmailDto, emailTemplatesFolder, sendEmail } from "utils/email";
import { readFileSync } from "fs";
const wss = new WebSocket.Server({ port: 8080 });

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, role, name } = req.body;
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });
  if (existingUser) {
    const customError = new CustomError(409, "General", "User already exists");
    return next(customError);
  }
  const userRole = role ?? Role.USER;

  const password = generateRandomPassword();
  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const data = {
      name,
      email,
      password: hashedPassword,
      role: userRole,
    };
    const newUser = await User.create(data);
    const jwtPayload: JwtUserPayload = {
      id: String(newUser.id),
      email: newUser.email,
      role: newUser.role,
    };
    const token = createAccessToken(jwtPayload);
    res.customSuccess(200, "User successfully created.", { ...newUser, token });
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      `User '${email}' can't be created`,
      null,
      err
    );
    return next(customError);
  }
};

export const registerDevice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identifier, modelType } = req.body;
    await Device.create({
      modelType,
      identifier,
      name: identifier,
      status: Status.REGISTERED,
    });
    logger.info("Device Registered successfully");
    res.customSuccess(200, "Device Registered successfully");
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
//       res.customSuccess(200, "Device fetched successfully", {
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
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const deviceId = req.body.deviceId;
    await UserDeviceMapping.create({ deviceId, userId, isDefault: true });
    await Device.updateOne({ deviceId }, { status: Status.CONNECTED });
    res.customSuccess(200, "Device connected successfully");
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
//     res.customSuccess(200, "Access Token Generated Successfully.", { token });
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

export const updateDeviceStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stateToBeUpdated = req.body.state as Status;
    const deviceId = req.body.deviceId;
    await Device.findOneAndUpdate({ deviceId },{status: stateToBeUpdated});
    if(stateToBeUpdated === Status.UNREGISTERED){
      await UserDeviceMapping.deleteMany({deviceId});
    }
    res.customSuccess(200, "Device status updated Successfully.");
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

export const generateCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  const existingUser = await User.findOne({
    where: {
      email,
    },
  });
  if (!existingUser) {
    const customError = new CustomError(400, "General", "User doesn't exist");
    return next(customError);
  }
  const password = generateRandomPassword();
  try {
    const hashedPassword = bcrypt.hashSync(password, 8);
    await User.findByIdAndUpdate(existingUser._id, {
      password: hashedPassword,
    });
    let html = readFileSync(
      emailTemplatesFolder + "credentials-generated.html"
    ).toString();
    html = html.replace("#email#", existingUser.email);
    html = html.replace("#password#", password);
    const sendEmailDto: SendEmailDto = {
      from: "sahilymenda@gmail.com",
      to: existingUser.email,
      html,
      subject: "Credentails Generated",
    };
    await sendEmail(sendEmailDto);
    res.customSuccess(200, "Generated Credentials successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      `User '${email}' can't be created`,
      null,
      err
    );
    return next(customError);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.query.email?.toString();
  const userName = req.query.userName?.toString();
  try {
    if (!email && !userName) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const user = await User.findOne({
      $or: [{ email }, { name: userName }],
    });
    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const deletedUser = await User.findByIdAndDelete(user._id);
    res.customSuccess(200, "User Deleted Successfully.", deletedUser);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();
    res.customSuccess(200, "Users Fetched Successfully.", users);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const getAllDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const devices = await Device.find();
    res.customSuccess(200, "Users Fetched Successfully.", devices);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const deactiveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.query.email?.toString();
  const userName = req.query.userName?.toString();
  const deactivated = req.query.block === "false" ? false : true;
  try {
    if (!email && !userName) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    const user = await User.findOne({
      $or: [{ email }, { name: userName }],
    });

    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }

    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      user._id,
      { deactivated },
      { new: true }
    );
    if (!updatedUser) {
      const customError = new CustomError(
        500,
        "General",
        "Failed to update user"
      );
      return next(customError);
    }
    res.customSuccess(200, "User Deactivated Successfully.", updatedUser);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email, deactivated: false });
    if (!user) {
      const customError = new CustomError(404, "General", "user not found");
      return next(customError);
    }
    if (!checkIfPasswordMatch(password, user.password)) {
      const customError = new CustomError(404, "General", "invalid password");
      return next(customError);
    }
    const jwtPayload: JwtUserPayload = {
      id: String(user.id),
      email: user.email,
      role: user.role,
    };
    try {
      const token = createAccessToken(jwtPayload);
      const loginResponse = { token: `Bearer ${token}` };
      res.customSuccess(
        200,
        "Access Token Generated Successfully.",
        loginResponse
      );
    } catch (err) {
      const customError = new CustomError(
        500,
        "Raw",
        "OOPS!! \n Something went wrong while generating Token",
        ["OOPS! Something went wrong \n Try Once Again"],
        err
      );
      return next(customError);
    }
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

const checkIfPasswordMatch = (
  unencryptedPassword: string,
  password: string
) => {
  return bcrypt.compareSync(unencryptedPassword, password);
};

export const createDataFromPostman = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const oldDate = new Date("2024-04-01");
    const endDate = new Date(oldDate);
    endDate.setDate(endDate.getDate() + 90);
    const device = await Device.create({ model: "Model 123", type: "Mobile" });
    const data = [];
    let currentDate = new Date(oldDate);
    while (currentDate < endDate) {
      data.push({
        timestamp: new Date(currentDate),
        temperature: Math.random() * 15 + 10,
        humidity: Math.random() * 30 + 40,
        deviceId: device.id,
      });
      currentDate.setSeconds(currentDate.getSeconds() + 10);
    }
    await WeatherData.insertMany(data);
    res.customSuccess(200, "Created Successfully");
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const postData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.temperature && req.body.humidity && req.device) {
      const dataToSend = {
        temperature: req.body.temperature,
        humidity: req.body.humidity,
      };
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(dataToSend));
      });
      const data = {
        timestamp: new Date(),
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        deviceId: req.device.id,
      };
      WeatherData.create(data);
    }
    return res.customSuccess(200, "Created Successfully");
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const getData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: IWeatherData[] = await WeatherData.find(
      { timestamp: { $lt: new Date(), $gt: new Date("2024-06-01") } },
      { timestamp: 1, humidity: 1, temperature: 1, _id: 0 }
    );
    res.customSuccess(200, "Fetched Successfully", data);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8);
}
