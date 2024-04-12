import { extname } from "path";

const sanitizeFilename = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9_\u0600-\u06FF.]/g, "_");
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

export const getFileName = (file: Express.Multer.File) => {
  // random date
  const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
  // file ext
  const fileExtension = extname(file.originalname);
  // file name without ext
  const originalFilename = file.originalname.replace(/\.[^/.]+$/, "");
  // sanitize filename
  const sanitizedFilename = sanitizeFilename(originalFilename);
  //
  const filename = `${sanitizedFilename}_${uniqueSuffix}${fileExtension}`;
  return filename;
};
