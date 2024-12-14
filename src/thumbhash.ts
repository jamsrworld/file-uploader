import sharp from "sharp";
import * as ThumbHash from "thumbhash";

export const getThumbHash = async (file: Buffer) => {
  const image = sharp(file).resize(100, 100, { fit: "inside" });
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const binaryThumbHash = ThumbHash.rgbaToThumbHash(
    info.width,
    info.height,
    data
  );
  const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString("base64");
  return thumbHashToBase64;
};
