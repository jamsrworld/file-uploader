import multer from "multer";
import path from "path";
import { getCurrentDate, getFileName } from "./utils";
import { mkdir, stat } from "fs/promises";

const UPLOADS_FOLDER_NAME = "uploads";

const pathDist = path.join(__dirname, "..", UPLOADS_FOLDER_NAME);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const relativeUploadDir = getCurrentDate();
    req.locals = {
      relativeUploadDir,
    };
    const uploadDir = path.join(pathDist, relativeUploadDir);

    try {
      await stat(uploadDir);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        await mkdir(uploadDir, { recursive: true });
      } else {
        throw error;
      }
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = getFileName(file);
    cb(null, fileName);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/webp" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg, .webp and .jpeg formats are allowed"));
    }
  },
}).single("file");
