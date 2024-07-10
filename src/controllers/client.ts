import { Client, Device, User } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { IClient, IClientDto, IDevice, IUser } from "types/mongodb";
import logger from "utils/logger";
import { CustomError } from "utils/response/custom-error/CustomError";

export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientData = req.body;
    const existingClient = await Client.findOne({ name: clientData.name });
    if (existingClient) {
      const customError = new CustomError(
        409,
        "General",
        "Client already exists"
      );
      return next(customError);
    }
    await Client.create({
      name: clientData.name,
      logo: clientData.logo,
      address: clientData.address,
      email: clientData.email,
      phone: clientData.phone,
      website: clientData.website,
    });
    logger.info("Client Created successfully");
    return res.customSuccess(200, "Client Created successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot create client",
      null,
      err
    );
    return next(customError);
  }
};

export const getClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientId = req.params.id;
    if (!clientId) {
      const customError = new CustomError(
        409,
        "General",
        "Client ID not found"
      );
      return next(customError);
    }
    const client: IClient | null = await Client.findOne({ id: clientId });
    if (!client) {
      const customError = new CustomError(409, "General", "Client not found");
      return next(customError);
    }
    console.log(client);
    const clientUsers: IUser[] = await User.find({ clientId });
    const clientDevices: IDevice[] = await Device.find({ clientId });
    const clientDetailsToBeSent: IClientDto = {
      id: client.id,
      address: client.address,
        createdAt: client.createdAt,
        email: client.email,
        logo: client.logo,
        name: client.name,
        phone: client.phone,
        updatedAt: client.updatedAt,
        website: client.website,
      devices: clientDevices.map(device => ({id: device.id,clientId: device.clientId,createdAt: device.createdAt,identifier: device.identifier,modelType: device.modelType,name: device.name,status: device.status,updatedAt: device.updatedAt})),
      users: clientUsers.map(user=> ({ id: user.id,clientId: user.clientId, createdAt: user.createdAt,deactivated: user.deactivated,email: user.email,name: user.email,password: user.password,role: user.role,updatedAt: user.updatedAt})),
    };
    return res.customSuccess(
      200,
      "Client Fetched successfully",
      clientDetailsToBeSent
    );
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot fetch client",
      null,
      err,
    );
    return next(customError);
  }
};

export const getAllClient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clients: IClient[] = await Client.find();
    const clientUsers: IUser[] = await User.find({clientId: {$in:clients.map(c => c.id)}});
    const clientDevices: IDevice[] = await Device.find({clientId: {$in:clients.map(c => c.id)}});
    const clientDetailsToBeSent: IClientDto[] = clients.map(client => {
      const devices = clientDevices
        .filter((d) => d.clientId === client.id)
        .map((device) => ({
          id: device.id,
          clientId: device.clientId,
          createdAt: device.createdAt,
          identifier: device.identifier,
          modelType: device.modelType,
          name: device.name,
          status: device.status,
          updatedAt: device.updatedAt,
        }));
      const users = clientUsers
        .filter((u) => u.clientId === client.id)
        .map((user) => ({
          id: user.id,
          clientId: user.clientId,
          createdAt: user.createdAt,
          deactivated: user.deactivated,
          email: user.email,
          name: user.email,
          password: user.password,
          role: user.role,
          updatedAt: user.updatedAt,
        }));
      return {
        id: client.id,
        address: client.address,
        createdAt: client.createdAt,
        email: client.email,
        logo: client.logo,
        name: client.name,
        phone: client.phone,
        updatedAt: client.updatedAt,
        website: client.website,
        devices,
        users,
      };
  });
    return res.customSuccess(200, "All Client Fetched successfully", clientDetailsToBeSent);
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot fetch all client",
      null,
      err
    );
    return next(customError);
  }
};
