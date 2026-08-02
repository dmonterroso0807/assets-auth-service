import mongoose from "mongoose";

// Configuración de Mongoose
mongoose.connection.on("connecting", () => {
  console.log("MongoDB | Intentando conectar...");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB | Conectado a MongoDB");
});

mongoose.connection.on("open", () => {
  console.log(
    "MongoDB | Conexión establecida correctamente con la base de datos",
  );
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB | Desconectado de la base de datos");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB | Error de conexión durante la ejecución:", err);
});

// Manejo de errores de conexión
export const dbConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB | Ya está conectado a la base de datos");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
  } catch (error) {
    console.error("Fallo crítico al conectar a la base de datos", {
      code: error.code || "UNKNOWN_ERR",
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Manejo de cierre de la aplicación
const gracefulShutdown = async (signal) => {
  console.log(
    `MongoDB | Recibida señal ${signal}. Cerrando conexión a la base de datos...`,
  );
  try {
    await mongoose.connection.close();
    console.log("MongoDB | Database connection closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB | Error during graceful shutdown:", error.message);
    process.exit(1);
  }
};

// Manejo de señales del sistema para cierre de la aplicación
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2"));
