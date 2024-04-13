import cors from "cors";
import "dotenv/config";
import express from "express";
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

app.post("/upload", upload, (req, res) => {
  if (!req.file || !req.locals) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { relativeUploadDir } = req.locals;
  const { filename } = req.file;
  return res.json({
    name: filename,
    url: `${relativeUploadDir}/${filename}`,
  });
});

app.get("*", serveFile);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
