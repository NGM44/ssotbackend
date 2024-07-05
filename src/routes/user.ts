import {
  changePassword,
  deactiveUser,
  deleteUser,
  forgotPassword,
  generateCredentials,
  getAllUsers,
  login,
  signUp,
} from "controllers/user";
import { Router } from "express";
import { checkJwt } from "utils/createJwtToken";

const router = Router();

router.post("/signUp", signUp);
router.post("/generateCredentials", checkJwt, generateCredentials);
router.delete("/", checkJwt, deleteUser);
router.get("/all", checkJwt, getAllUsers);
router.get("/deactive", checkJwt, deactiveUser);
router.post("/login", login);
router.post("/changePassword", changePassword);
router.post("/forgotPassword", forgotPassword);

export default router;
