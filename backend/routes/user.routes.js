import express from "express";
import { getResume, getUserProfile, updateUserProfile, } from "../controllers/user.controller.js";
import { authMiddleware,authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, getUserProfile);
userRouter.get('/resume/:id',getResume ); // New route for resume

userRouter.put("/profile", authMiddleware, authorize("user",), upload.single("resume"), updateUserProfile);

export default userRouter;