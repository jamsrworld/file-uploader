import cors from "cors";
import "dotenv/config";
import express from "express";
import fileUpload from "express-fileupload";
import { readFile } from "fs/promises";
import path from "path";
import { getPlaiceholder } from "plaiceholder";
import {
  ALLOWED_ORIGINS,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  UPLOAD_PATH_DIST,
} from "./config";
import { serveFile } from "./serve-file";
import {
  getCurrentDate,
  getFileAbsPath,
  getFileName,
  isImageMimetype,
} from "./utils";

const app = express();
app.disable("x-powered-by");

app.use(
  express.json({
    limit: "500mb",
  })
);
app.use(
  express.urlencoded({
    limit: "500mb",
    extended: true,
  })
);

// cors
app.use((req, res, next) => {
  if (req.method === "POST") {
    cors({
      origin: ALLOWED_ORIGINS,
    })(req, res, next);
  } else {
    cors({
      origin: "*",
    })(req, res, next);
  }
});

// get
app.get("/", (_, res) => {
  return res.json({
    message: "welcome to cdn",
    lastUpdatedAt: "2024-11-08T15:12:24.100Z",
  });
});
app.get("*", serveFile);

// file upload
app.use(
  fileUpload({
    limits: {
      fieldSize: MAX_FILE_SIZE,
    },
    createParentPath: true,
    abortOnLimit: true,
    uploadTimeout: 0,
  })
);
const moveFile = (
  mv: (path: string, callback: (err: any) => void) => void,
  filePath: string
) => {
  return new Promise((resolve, reject) => {
    mv(filePath, (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
};

app.post("/upload/:username?", async (req, res) => {
  try {
    const { files } = req;
    const { username } = req.params;
    if (!files || !files.file) {
      return res.status(400).json({ error: "No files chosen" });
    }
    const file = files.file as fileUpload.UploadedFile;
    const { name, mimetype, mv, md5, size } = file;
    const relativeUploadDir = path.join(username ?? "", getCurrentDate());
    const uploadDir = path.join(UPLOAD_PATH_DIST, relativeUploadDir);
    const newFileName = getFileName(name);

    const uploadPath = `${uploadDir}/${newFileName}`;
    const fileUrl = `${relativeUploadDir}/${newFileName}`;

    const isImage = isImageMimetype(mimetype);
    let data: Record<string, unknown> = {
      name,
      url: fileUrl,
      absUrl: getFileAbsPath(fileUrl),
      size,
      isImage,
    };
    await moveFile(mv, uploadPath);

    if (isImage) {
      if (size > MAX_IMAGE_SIZE) {
        return res.status(413).json({ error: "File is too large" });
      }
      const file = await readFile(uploadPath);
      const {
        base64,
        metadata: { width, height, format },
      } = await getPlaiceholder(file, {
        size: 10,
      });
      data = {
        ...data,
        placeholder: base64,
        width,
        height,
        format,
      };
    }
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
