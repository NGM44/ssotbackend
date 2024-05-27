import { getData } from "controllers/app/getData";
import { postData } from "controllers/app/putData";
import { Router } from "express";
import { checkJwt } from "utils/createJwtToken";

const router = Router();

router.get("/data",checkJwt, getData);
router.post("/data", checkJwt, postData);

export default router;