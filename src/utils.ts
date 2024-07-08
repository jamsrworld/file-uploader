import { mkdir, stat } from "fs/promises";
import { extname } from "path";

const sanitizeFilename = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9_\u0600-\u06FF.]/g, "-");
};

export const getCurrentDate = () => {
  let date = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());
  date = date.replace(/\//g, "-");
  return date;
};

export const getFileName = (name: string) => {
  // random date
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  // file ext
  const fileExtension = extname(name);
  // file name without ext
  const originalFilename = name.replace(/\.[^/.]+$/, "");
  // sanitize filename
  const sanitizedFilename = sanitizeFilename(originalFilename);
  //
  const filename = `${sanitizedFilename}-${uniqueSuffix}${fileExtension}`;
  return filename;
};

//! prevents directory traversal
export const validatePath = (filename: string) => {
  // Regular expression to match allowed characters and prevent directory traversal
  const regex = /\.\.\//g;
  if (regex.test(filename)) throw new Error("File not found");
};

export const isImageMimetype = (mimetype: string) => {
  return mimetype.startsWith("image/");
};

export const getFileAbsPath = (name: string) => {
  return process.env.APP_URL + "/" + name;
};

// export const createDirIfNotExist = async (path: string) => {
//   try {
//     await stat(path);
//   } catch (error) {
//     if (
//       typeof error === "object" &&
//       error !== null &&
//       "code" in error &&
//       error.code === "ENOENT"
//     ) {
//       await mkdir(path, { recursive: true });
//     } else {
//       throw error;
//     }
//   }
// };
