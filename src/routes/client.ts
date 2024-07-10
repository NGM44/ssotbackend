import { createClient, getClient } from "controllers/client";
import { Router } from "express";

const router = Router();

router.post("/create", createClient);
router.get("/:id", getClient);

export default router;
