import { login } from "controllers/index";
import { signUp } from "controllers/index";
import { Router } from "express";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);

export default router;
