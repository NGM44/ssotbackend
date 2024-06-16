import {
  connectDeviceWithUser,
  getAllDevices,
  registerDevice as register,
  updateStatus,
} from "controllers/device";
import {
  createDataFromPostman,
  generateReport,
  getData,
  postData,
} from "controllers/weather";
import { Router } from "express";
import { checkDeviceJwt, checkJwt } from "utils/createJwtToken";

const router = Router();

router.post("/data", checkDeviceJwt, postData);
router.post("/createDataFromPostman", checkJwt, createDataFromPostman);
router.put("/updateStatus", updateStatus);
router.get("/data", checkJwt, getData);
router.post("/report", checkJwt, generateReport);

export default router;
