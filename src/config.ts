import path from "path";

const UPLOADS_FOLDER_NAME = "uploads";
export const UPLOAD_PATH_DIST = path.join(process.cwd(), UPLOADS_FOLDER_NAME);
export const MAX_FILE_SIZE = 500 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_ORIGINS = [
  /\.?jamsrworld\.com$/,
  /\.?jamsrworld\.dev$/,
  /\.?jamsrpay\.com$/,
  /\.?localhost:[0-9]+$/,
  "https://naino-shop.vercel.app",
  "https://fx-cartt.vercel.app",
];
