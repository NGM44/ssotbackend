import { updateStatus } from "controllers/device";
import {
  createDataFromPostman,
  generateReport,
  getData,
  postData,
} from "controllers/weather";
import { Router } from "express";
import {
  checkDeviceJwt,
  checkJwt,
  createDeviceToken,
} from "utils/createJwtToken";

const router = Router();

router.post("/data", checkDeviceJwt, postData);
router.post("/deviceJwt", createDeviceToken);
router.post("/createDataFromPostman", checkJwt, createDataFromPostman);
router.get("/data", checkJwt, getData);
router.post("/report", checkJwt, generateReport);

export default router;
