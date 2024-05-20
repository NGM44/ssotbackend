import { blockUser, deleteUser } from "controllers/admin/deleteUser";
import { Router } from "express";

const router = Router();

router.delete("/deleteuser", deleteUser);
router.get("/blockuser", blockUser);

export default router;
