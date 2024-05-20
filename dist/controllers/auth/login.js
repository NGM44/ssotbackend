"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const CustomError_1 = require("../../utils/response/custom-error/CustomError");
const createJwtToken_1 = require("../../utils/createJwtToken");
const ssotdb_1 = __importDefault(require("db/ssotdb"));
const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await ssotdb_1.default.user.findFirst({ where: { email } });
        if (!user) {
            const customError = new CustomError_1.CustomError(404, "General", "user not found");
            return next(customError);
        }
        if (checkIfPasswordMatch(password, user.password)) {
            const customError = new CustomError_1.CustomError(404, "General", "invalid password");
            return next(customError);
        }
        const jwtPayload = {
            id: String(user.id),
            name: user.name ?? "",
            email: user.email ?? "",
            role: user.role,
        };
        try {
            const token = (0, createJwtToken_1.createAccessToken)(jwtPayload);
            const loginResponse = { token: `Bearer ${token}` };
            res.customSuccess(200, "Access Token Generated Successfully.", loginResponse);
        }
        catch (err) {
            const customError = new CustomError_1.CustomError(500, "Raw", "OOPS!! \n Something went wrong while generating Token", ["OOPS! Something went wrong \n Try Once Again"], err);
            return next(customError);
        }
    }
    catch (err) {
        const customError = new CustomError_1.CustomError(500, "Raw", "Error", null, err);
        return next(customError);
    }
};
exports.login = login;
const checkIfPasswordMatch = (unencryptedPassword, password) => {
    return bcryptjs_1.default.compareSync(unencryptedPassword, password);
};
//# sourceMappingURL=login.js.map