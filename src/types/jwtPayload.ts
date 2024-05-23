import { Role } from "@prisma/client";

export type JwtPayload = {
    id: string;
    name: string;
    email: string;
    role: Role;
  };