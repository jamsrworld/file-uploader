import cors from "cors";
import "dotenv/config";
import express from "express";
import { readFile } from "fs/promises";
import path from "path";
import { getPlaiceholder } from "plaiceholder";
import { serveFile } from "./server-file";
import { upload } from "./upload";

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  return res.json({
    message: "welcome to cdn",
  });
});

app.post("/upload", upload, async (req, res) => {
  try {
    if (!req.file || !req.locals) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { relativeUploadDir } = req.locals;
    const { filename } = req.file;
    const fileUrl = `${relativeUploadDir}/${filename}`;

    const file = await readFile(path.join("uploads", fileUrl));
    const {
      base64,
      metadata: { width, height, format, size },
    } = await getPlaiceholder(file);

    return res.json({
      name: filename,
      url: fileUrl,
      base64,
      width,
      height,
      format,
      size,
    });
  } catch {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.get("*", serveFile);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
