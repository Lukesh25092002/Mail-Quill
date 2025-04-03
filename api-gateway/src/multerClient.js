import { fileURLToPath } from 'url';
import path, { dirname } from "path";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.resolve(__dirname,"../public/uploads"));
//     },
//     filename: (req, file, cb) => {
//         const userId = req.user._id.toString();
//         const filename = userId + path.extname(file.originalname);
//         cb(null, filename);
//     }
// });

const multerClient = multer({ storage });

export default multerClient;