import {
  adminSignUp,
  changePassword,
  deactiveUser,
  deleteUser,
  forgotPassword,
  generateCredentials,
  getAllUsers,
  login,
  resetPassword,
  signUp,
} from "controllers/user";
import { Router } from "express";
import { checkJwt } from "utils/createJwtToken";

const router = Router();

router.post("/signUp", signUp);
router.post("/adminSignUp", adminSignUp);
router.post("/generateCredentials", checkJwt, generateCredentials);
router.delete("/:id", checkJwt, deleteUser);
router.get("/all", checkJwt, getAllUsers);
router.get("/deactive", checkJwt, deactiveUser);
router.post("/login", login);
router.post("/changePassword", checkJwt, changePassword);
router.post("/resetPassword", checkJwt, resetPassword);
router.post("/forgotPassword", forgotPassword);

export default router;
