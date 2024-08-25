import {
  adminSignUp,
  changeNewPassword,
  changePassword,
  deactiveUser,
  deleteUser,
  forgotPassword,
  generateCredentials,
  getAllUsers,
  login,
  resetPassword,
  signUp,
  updateUserDetail,
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
router.post("/changeNewPassword", checkJwt, changeNewPassword);

router.post("/resetPassword", checkJwt, resetPassword);
router.post("/forgotPassword", forgotPassword);
router.put('/userDetails', checkJwt, updateUserDetail);

export default router;
