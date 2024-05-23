import { Request, Response } from "express";
import admin from "./admin";
import app from "./app";
import auth from "./auth";

const { Router } = require("express");

const router = Router();

router.use("/app", app);
router.use("/auth", auth);
router.use("/admin", admin);
router.use("/loadTest", async (req: Request, res: Response) => {
  res.customSuccess(200, "success");
});

export default router;
