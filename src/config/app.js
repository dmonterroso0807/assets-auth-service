import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./db.js";
import { assertProductionSafety } from "./env-safety-check.js";

// Configuración de la aplicación
import { rateLimitConfig } from "../middlewares/rateLimit-configuration.js";
import { corsOptions } from "./cors-configuration.js";
import { helmetConfiguration } from "./helmet-configuration.js";
import { sanitizeBody } from "../middlewares/sanitize-middleware.js";
import {
  notFoundHandler,
  globalErrorHandler,
} from "../middlewares/error-middleware.js";
import { seedAdmin } from "../utils/seedAdmin.js";
import { verifyMailerConnection } from "../utils/mailer.js";
import routes from "../routes/index.js";

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(express.json({ limit: "100kb" }));
  // Anti NoSQL-injection
  app.use(sanitizeBody);
  // Configuraciones de Cors
  app.use(cors(corsOptions));
  // Configuraciones de Helmet
  app.use(helmet(helmetConfiguration));
  // Configuración de Rate Limit
  app.use(rateLimitConfig);
  // Configuracion de Morgan
  app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
};

const mountRoutes = (app) => {
  app.get("/health-check", (req, res) => {
    res.status(200).json({ success: true, message: "auth-service OK" });
  });
  app.use("/api/auth", routes);
  app.use(notFoundHandler);
  app.use(globalErrorHandler);
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT;
  app.set("trust proxy", 1); // Configuración para confiar en el proxy (útil si estás detrás de un proxy inverso)
  assertProductionSafety();

  try {
    await dbConnection();
    await seedAdmin();
    await verifyMailerConnection();
    middlewares(app);
    mountRoutes(app);
    app.listen(PORT, () => {
      console.log(
        `Servidor escuchando en el puerto ${PORT} - Modo: ${process.env.NODE_ENV}`,
      );
      console.log(`Health check: http://localhost:${PORT}/health-check`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};
