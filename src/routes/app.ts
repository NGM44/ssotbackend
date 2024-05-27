import { getData } from "controllers/app/getData";
import { postData } from "controllers/app/putData";
import { Router } from "express";

const router = Router();

router.get("/data", getData);
router.post("/data", postData);

export default router;