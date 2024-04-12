import express from "express";
import cors from "cors";
import { upload } from "./upload";
import path from "path";

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/", express.static(uploadsDir));

app.post("/upload", upload, (req, res) => {
  if (!req.file || !req.locals) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { relativeUploadDir } = req.locals;
  const { filename } = req.file;
  return res.json({
    message: "File uploaded successfully",
    file: {
      name: filename,
      url: `${relativeUploadDir}/${filename}`,
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
