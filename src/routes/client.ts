import { createClient } from "controllers/client";
import { Router } from "express";

const router = Router();

router.post("/create", createClient);

export default router;
