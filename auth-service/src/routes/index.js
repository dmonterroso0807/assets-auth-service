import { Router } from "express";
import authRoutes from "./auth-route.js";
import verificationRoutes from "./verification-route.js";
import userRoutes from "./user-route.js";

const router = Router();

router.use(authRoutes);
router.use(verificationRoutes);
router.use(userRoutes);

export default router;
