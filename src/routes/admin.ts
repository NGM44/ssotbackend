import { deactiveUser, deleteUser } from "controllers/admin/deleteUser";
import { Router } from "express";
import { checkJwt } from "utils/createJwtToken";

const router = Router();

router.delete("/deleteuser", checkJwt,deleteUser);
router.get("/blockuser", checkJwt,deactiveUser);

export default router;
