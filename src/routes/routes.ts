import app from "./app";
import auth from "./auth";
import admin from "./admin";

const { Router } = require("express");

const router = Router();

router.use("/app", app);
router.use("/auth", auth);
router.use("/admin", admin);
router.use("/",)

export default router;
