import {
  connectDeviceWithClient,
  connectDeviceWithUser,
  getAllDevices,
  getUserDevices,
  registerDevice as register,
  updateStatus,
} from "controllers/device";
import { Router } from "express";
import { checkJwt } from "utils/createJwtToken";

const router = Router();

router.post("/register", register);
router.post("/connectDeviceWithUser", checkJwt, connectDeviceWithUser);
router.post("/connectDeviceWithClient", checkJwt, connectDeviceWithClient);
router.put("/updateStatus", updateStatus);
router.get("/all", checkJwt, getAllDevices);
router.get("/user", checkJwt, getUserDevices);

export default router;
