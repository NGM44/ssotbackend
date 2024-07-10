import { createClient, getAllClient, getClient } from "controllers/client";
import { Router } from "express";

const router = Router();

router.post("/create", createClient);
router.get("/:id", getClient);
router.get("/all/details",getAllClient)

export default router;
