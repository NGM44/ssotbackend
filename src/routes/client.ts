import { createClient, getAllClient, getClient, updateBannerMsg, updateGasMapping } from "controllers/client";
import { Router } from "express";

const router = Router();

router.post("/create", createClient);
router.put("/mapping", updateGasMapping);
router.put("/bannerMessage", updateBannerMsg);

router.get("/:id", getClient);
router.get("/all/details", getAllClient);

export default router;
