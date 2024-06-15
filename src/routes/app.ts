import { getData, postData } from "controllers/index";
import { createDataFromPostman } from "controllers/index";
import { Router } from "express";
import { checkJwt } from "utils/createJwtToken";

const router = Router();

router.get("/data", checkJwt, getData);
router.post("/data", checkJwt, postData);
router.post("/create-data", checkJwt, createDataFromPostman);

export default router;
