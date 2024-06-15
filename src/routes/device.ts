import {
  connectDeviceWithUser,
  getAllDevices,
  registerDevice as register,
  updateStatus,
} from "controllers/device";
import { Router } from "express";
import { checkJwt } from "utils/createJwtToken";

const router = Router();

router.post("/register", register);
router.post("/connectDeviceWithUser", checkJwt, connectDeviceWithUser);
router.put("/updateStatus", updateStatus);
router.get("/all", checkJwt, getAllDevices);

export default router;
