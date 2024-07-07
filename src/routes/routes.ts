import { Request, Response, Router } from "express";
import device from "./device";
import user from "./user";
import weather from "./weather";
import client from "./client";

const router = Router();

router.use("/user", user);
router.use("/device", device);
router.use("/client", client);
router.use("/weather", weather);
router.use("/loadTest", async (req: Request, res: Response) =>
  res.customSuccess(200, "success"),
);

export default router;
