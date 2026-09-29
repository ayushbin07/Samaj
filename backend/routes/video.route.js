import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { publishVideo } from "../controllers/video.controller.js";

const router = Router();

// Video file uploads are not supported in this serverless deployment.
// This route exists to return a clear error to any client that still calls it.
router.route("/publish").post(verifyJWT, publishVideo);

export default router;