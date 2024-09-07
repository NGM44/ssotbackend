import { createClient, getAllClient, getClient, updateGasMapping } from "controllers/client";
import { Router } from "express";

const router = Router();

router.post("/create", createClient);
router.put("/mapping", updateGasMapping);
router.get("/:id", getClient);
router.get("/all/details", getAllClient);

export default router;
