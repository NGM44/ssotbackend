import { JwtPayload } from "../types/jwtPayload";
import jwt from 'jsonwebtoken';

export const createAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
        algorithm: "HS512"
    });
};