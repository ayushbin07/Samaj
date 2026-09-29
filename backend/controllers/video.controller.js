import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Video file uploads are not supported in this deployment.
// This endpoint returns a clear error guiding clients to use image-only posts.
const publishVideo = asyncHandler(async (req, res) => {
  return res
    .status(410)
    .json(
      new ApiResponse(
        410,
        null,
        "Video uploads are not supported. Please share content as an image post via /api/v1/tweets."
      )
    );
});

export { publishVideo };
