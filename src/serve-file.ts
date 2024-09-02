import { Request, Response } from "express";
import { createReadStream, existsSync } from "fs";
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
        message: "File not found",
      });
    }
    
    const { query, url } = data.data;
    const { w: width, q: quality = 100 } = query ?? { w: null, q: 100 };

    validatePath(url);

    const filePath = path.join(UPLOAD_PATH_DIST, url);
    if (!existsSync(filePath)) {
      return res.status(400).json({
        message: "File not found",
      });
    }

    const fileExtension = path.extname(url).substring(1);
    const mimeType = mimeTypes.lookup(fileExtension);
    if (!mimeType) {
      return createReadStream(filePath).pipe(res);
    }

    if (width && isImageMimetype(mimeType)) {
      const { width: fileWidth, height: fileHeight } = sizeOf(filePath);
      if (!fileHeight || !fileWidth) {
        return createReadStream(filePath).pipe(res);
      }

      const resizeWidth = Math.min(fileWidth, width);
      let resizedImage = sharp(filePath).resize(resizeWidth);
      switch (mimeType) {
        case "image/jpeg":
          resizedImage = resizedImage.jpeg({ quality });
          break;
        case "image/png":
          resizedImage = resizedImage.png({ quality });
          break;
        case "image/webp":
          resizedImage = resizedImage.webp({ quality });
          break;
        default:
          break;
      }
    }
    res.set("Content-Type", mimeType);
    createReadStream(filePath).pipe(res);
  } catch (error) {
    const { message } =
      error instanceof Error ? error : { message: "Server Error" };
    res.status(500).json({ message });
  }
};
