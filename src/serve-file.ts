import { Request, Response } from "express";
import { createReadStream } from "fs";
import fs from "fs/promises";
import sizeOf from "image-size";
import mimeTypes from "mime-types";
import path from "path";
import sharp from "sharp";
import { number, object, string } from "zod";
import { UPLOAD_PATH_DIST } from "./config";
import { isImageMimetype, validatePath } from "./utils";

const schema = object({
  url: string().transform((val) => val.split("?")[0]),
  query: object({
    w: string().transform(Number).pipe(number().int().positive()).optional(),
    q: string().transform(Number).pipe(number().int().positive()).optional(),
  }).optional(),
});

export const serveFile = async (req: Request, res: Response) => {
  try {
    const data = schema.safeParse(req);
    if (!data.success) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }
    const { query, url } = data.data;
    const { w: width, q: quality = 100 } = query ?? { w: null, q: 100 };

    validatePath(url);

    const filePath = path.join(UPLOAD_PATH_DIST, url);

    try {
      await fs.access(filePath); // Async file existence check
    } catch (err) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileExtension = path.extname(url).substring(1);
    const mimeType = mimeTypes.lookup(fileExtension);
    if (!mimeType) {
      return createReadStream(filePath).pipe(res);
    }
    res.set("Content-Type", mimeType);
    // Add cache control headers for static assets
    res.set("Cache-Control", "public, max-age=31536000");

    if (width && isImageMimetype(mimeType)) {
      const { width: originalWidth, height: originalHeight } = sizeOf(filePath);
      if (!originalHeight || !originalWidth) {
        return createReadStream(filePath).pipe(res);
      }

      const resizeWidth = Math.min(originalWidth, width);
      let resizedImage = sharp(filePath).resize(resizeWidth).withMetadata();
      switch (mimeType) {
        case "image/jpeg":
          resizedImage = resizedImage.jpeg({ quality });
          break;
        case "image/png":
          resizedImage = resizedImage.png({ compressionLevel: 9, quality });
          break;
        case "image/webp":
          resizedImage = resizedImage.webp({ quality });
          break;
        case "image/avif":
          resizedImage = resizedImage.avif({ quality });
          break;
        default:
          return createReadStream(filePath).pipe(res);
      }
      return resizedImage.pipe(res);
    }
    return createReadStream(filePath).pipe(res);
  } catch (error) {
    const { message } =
      error instanceof Error ? error : { message: "Server Error" };
    console.error("Error serving file:", message);
    res.status(500).json({ message: "Internal server error" });
  }
};
