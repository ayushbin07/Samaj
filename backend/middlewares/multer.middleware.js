import multer from "multer";

// Uses in-memory storage so no filesystem writes occur.
// This makes the backend compatible with serverless environments (e.g. Vercel)
// where the filesystem is read-only.
const memoryStorage = multer.memoryStorage();

// Image-only filter — rejects any non-image mimetype
const imageOnly = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPG, PNG, GIF, WebP, etc.)"));
  }
};

// General image upload (avatar, cover image, thumbnails)
const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: imageOnly,
});

// Post/tweet image attachment upload
const tweetMediaUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB
  },
  fileFilter: imageOnly,
});

export { upload, tweetMediaUpload };
