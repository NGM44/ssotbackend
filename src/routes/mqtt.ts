
import { Router } from "express";
import { publishWeatherData } from "mqttserver";
import { checkDeviceJwt } from "utils/createJwtToken";


const router = Router();

router.post("/send",checkDeviceJwt, publishWeatherData);

export default router;
