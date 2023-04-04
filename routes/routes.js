import { Router } from "express";
import stats from "../controllers/stats.js";
import Auth from "../middleware/auth.js";
const router = Router();
router.route("/admin/stats").get(Auth.isLoggedIn, Auth.isAdmin, stats);
export default router;
