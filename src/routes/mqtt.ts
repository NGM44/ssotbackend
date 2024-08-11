
import { Router } from "express";
import { publishWeatherData } from "mqtt";
import { checkDeviceJwt } from "utils/createJwtToken";


const router = Router();

router.post("/send",checkDeviceJwt, publishWeatherData);

export default router;
