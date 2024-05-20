import { response, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
response.customSuccess = function (httpStatusCode: number, message: string, data: any = null): Response {
    return this.status(httpStatusCode).json({ message, data });
};
