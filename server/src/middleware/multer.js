import multer from "multer";
import path from "path";

// ✅ Storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user?.userId || "guest"}-${Date.now()}${ext}`);
  },
});

// ✅ File filter (images + pdfs)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png/;
  const allowedDocTypes = /pdf/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

  if (allowedImageTypes.test(ext) || allowedDocTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, PNG images or PDF files are allowed"), false);
  }
};

// ✅ Multer config
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;
