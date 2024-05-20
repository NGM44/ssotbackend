import { login } from "controllers/auth/login";
import { signUp, userNameAvailablity } from "controllers/auth/signUp";
import { Router } from "express";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/availability", userNameAvailablity);

export default router;
