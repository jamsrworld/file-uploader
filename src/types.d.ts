declare namespace Express {
  export interface Request {
    locals?: {
      relativeUploadDir: string;
    };
  }
}
