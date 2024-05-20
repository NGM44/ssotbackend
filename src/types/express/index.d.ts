import { AccessControl } from 'role-acl';
import { JwtPayload } from '../JwtPayload';
import { ResetTokenPayload } from '../ResetTokenPayload';


declare global {
  namespace Express {
    export interface Request {
      resetTokenPayload: ResetTokenPayload;
      jwtPayload: JwtPayload;
      user:JwtPayload,
      language: 'Language';
      roleName: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query: any;
    }
    export interface Response {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customSuccess(httpStatusCode: number, message: string, data?: any): Response;
    }
  }
}