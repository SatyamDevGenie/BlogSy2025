// Load .env as early as possible (before any route/controller that uses process.env)
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// .env lives at project root: backend/../.env
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
