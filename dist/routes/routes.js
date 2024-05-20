"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const auth_1 = __importDefault(require("./auth"));
const { Router } = require("express");
const router = Router();
router.use('/app', app_1.default);
router.use('/auth', auth_1.default);
exports.default = router;
//# sourceMappingURL=routes.js.map