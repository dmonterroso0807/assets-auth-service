import dotenv from "dotenv";
import { initServer } from "./src/config/app.js";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

initServer();
