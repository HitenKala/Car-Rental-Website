import multer from "multer";
import path from "path";
import os from "os";

// Use the system tmp directory in serverless environments (writable)
const tmpUploadsDir = path.join(os.tmpdir(), "uploads");

const upload = multer({ dest: tmpUploadsDir });

export default upload;