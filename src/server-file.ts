import { Request, Response } from "express";
import { existsSync, readFileSync } from "fs";
import sizeOf from "image-size";
import mimeTypes from "mime-types";
import path from "path";
import sharp from "sharp";
import { number, object, string } from "zod";
import { validatePath } from "./utils";

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

    const filePath = path.join(process.cwd(), "uploads", url);
    console.log("filePath:->", filePath);

    if (!existsSync(filePath)) {
      return res.status(400).json({
        message: "File not found",
      });
    }

    const fileContent = readFileSync(filePath);
    const fileExtension = path.extname(url).substring(1);
    const mimeType = mimeTypes.lookup(fileExtension);

    if (!mimeType) return res.send(fileContent);
    let imageContent = fileContent;

    if (width && mimeType.startsWith("image/")) {
      const { width: fileWidth, height: fileHeight } = sizeOf(filePath);
      if (!fileHeight || !fileWidth) {
        return res.send(fileContent);
      }

      const resizeWidth = Math.min(fileWidth, width);
      let resizedImage = sharp(fileContent).resize(resizeWidth);
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
      imageContent = await resizedImage.toBuffer();
    }
    res.set("Content-Type", mimeType);
    res.send(imageContent);
  } catch (error) {
    const { message } =
      error instanceof Error ? error : { message: "Server Error" };
    res.status(500).json({ message });
  }
};
