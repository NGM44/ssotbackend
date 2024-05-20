"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userNameAvailablity = exports.signUp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const CustomError_1 = require("../../utils/response/custom-error/CustomError");
const ssotdb_1 = __importDefault(require("db/ssotdb"));
const client_1 = require("@prisma/client");
const ulid_1 = require("ulid");
const signUp = async (req, res, next) => {
    const { userName, email, password, role } = req.body;
    const existingUser = await ssotdb_1.default.user.findFirst({
        where: {
            email,
        },
    });
    if (!userName) {
        const customError = new CustomError_1.CustomError(409, "General", "User name is required");
        return next(customError);
    }
    if (existingUser) {
        const customError = new CustomError_1.CustomError(409, "General", "User already exists");
        return next(customError);
    }
    if (role === client_1.Role.Admin || role === client_1.Role.Company || role === client_1.Role.User) {
        const customError = new CustomError_1.CustomError(403, "General", "Invalid Role");
        return next(customError);
    }
    try {
        const hashedPassword = bcryptjs_1.default.hashSync(password, 8);
        const data = {
            id: (0, ulid_1.ulid)(),
            createdAt: new Date(),
            updatedAt: new Date(),
            name: userName,
            email,
            password: hashedPassword,
            role,
        };
        const newUser = await ssotdb_1.default.user.create({
            data,
        });
        res.customSuccess(200, "User successfully created.", newUser);
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(400, "Raw", `User '${email}' can't be created`, null, err);
        return next(customError);
    }
};
exports.signUp = signUp;
const userNameAvailablity = async (req, res, next) => {
    const userName = req.query.userName?.toString() ?? "";
    const regex = /\w+/;
    if (regex.test(userName)) {
        const customError = new CustomError_1.CustomError(409, "General", "User Name Should Only Include Alphabets ,Number or underscore");
        return next(customError);
    }
    else if (userName.length < 4) {
        const customError = new CustomError_1.CustomError(409, "General", "User Name should consist minimum 4 characters");
        return next(customError);
    }
    const userExist = await ssotdb_1.default.user.findFirst({
        where: {
            name: userName,
        },
    });
    if (userExist) {
        const customError = new CustomError_1.CustomError(409, "General", "User Name Exists");
        return next(customError);
    }
    res.customSuccess(200, "User Name Available", userName);
};
exports.userNameAvailablity = userNameAvailablity;
//# sourceMappingURL=signUp.js.map