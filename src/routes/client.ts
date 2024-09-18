import { createClient, getAllClient, getClient, updateBannerMsg, updateGasMapping } from "controllers/client";
import { Router } from "express";
import { checkAdminJwt } from "utils/createJwtToken";

const router = Router();

router.post("/create", checkAdminJwt, createClient);
router.put("/mapping",checkAdminJwt, updateGasMapping);
router.put("/bannerMessage", checkAdminJwt, updateBannerMsg);

router.get("/:id",checkAdminJwt, getClient);
router.get("/all/details",checkAdminJwt, getAllClient);

export default router;
