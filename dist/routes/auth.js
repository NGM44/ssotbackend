"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signUp_1 = require("controllers/auth/signUp");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/signup", signUp_1.signUp);
router.get("/availability", signUp_1.userNameAvailablity);
exports.default = router;
//# sourceMappingURL=auth.js.map