# 🔐 Auth Service — SmartAssets

Microservicio de autenticación y autorización para **SmartAssets**, un sistema bancario basado en microservicios. Se encarga del registro, login, emisión y validación de tokens JWT para el resto de los servicios del sistema.

> Este servicio forma parte del monorepo `SmartAssets`, ubicado en `/auth-service`.

## 📋 Tabla de contenido

- [Stack](#-stack)
- [Arquitectura del servicio](#-arquitectura-del-servicio)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts disponibles](#-scripts-disponibles)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Seguridad](#-seguridad)
- [Roadmap](#-roadmap)

## 🛠 Stack

| Categoría          | Tecnología                       |
| ------------------ | -------------------------------- |
| Runtime            | Node.js (ESM)                    |
| Framework          | Express 5                        |
| Base de datos      | MongoDB + Mongoose               |
| Autenticación      | JSON Web Tokens (jsonwebtoken)   |
| Hashing            | bcrypt                           |
| Validación         | Zod                              |
| Seguridad HTTP     | Helmet, CORS, express-rate-limit |
| Logging            | Morgan                           |
| Testing            | Jest + Supertest                 |
| Linting            | ESLint                           |
| Gestor de paquetes | pnpm                             |

## 🏗 Arquitectura del servicio

El servicio conecta a MongoDB al arrancar, aplica una capa de middlewares de seguridad (Helmet, CORS, rate limiting) antes de exponer rutas, y maneja el cierre elegante de la conexión a base de datos ante señales del sistema (`SIGINT`, `SIGTERM`, `SIGUSR2`).

```
Cliente → Rate Limit → CORS → Helmet → Rutas → Controllers → MongoDB
```

## ✅ Requisitos previos

- Node.js ≥ 18
- pnpm ≥ 8
- Una instancia de MongoDB corriendo (local o remota)

## 🚀 Instalación

```bash
# Clonar el monorepo
git clone https://github.com/dmonterroso0807/smart-assets.git
cd smart-assets/auth-service

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env
# Edita .env con tus propios valores (Mongo URI, JWT secret, etc.)

# Levantar en modo desarrollo
pnpm run dev
```

El servidor quedará disponible en `http://localhost:3000` (o el puerto que definas en `.env`).

## 🔑 Variables de entorno

Estas son las variables que el servicio necesita (ver `.env.example`):

| Variable                 | Descripción                                         |
| ------------------------ | --------------------------------------------------- |
| `NODE_ENV`               | Entorno de ejecución (`development` / `production`) |
| `PORT`                   | Puerto en el que escucha el servidor                |
| `MONGO_URI`              | Cadena de conexión a MongoDB                        |
| `JWT_SECRET`             | Secreto usado para firmar los tokens JWT            |
| `JWT_EXPIRES_IN`         | Tiempo de expiración del access token               |
| `JWT_REFRESH_EXPIRES_IN` | Tiempo de expiración del refresh token              |
| `JWT_ISSUER`             | Emisor del token (claim `iss`)                      |
| `JWT_AUDIENCE`           | Audiencia del token (claim `aud`)                   |

## 📜 Scripts disponibles

```bash
pnpm run dev      # Levanta el servidor con nodemon (auto-reload)
pnpm start        # Levanta el servidor en modo producción
pnpm test         # Corre los tests con Jest
pnpm test:watch   # Corre los tests en modo watch
```

## 📁 Estructura del proyecto

```
auth-service/
├── src/
│   └── config/
│       ├── app.js                     # Inicialización del servidor y middlewares
│       ├── db.js                      # Conexión a MongoDB y manejo de eventos
│       ├── cors-configuration.js      # Configuración de CORS
│       ├── helmet-configuration.js    # Configuración de headers de seguridad
│       └── rateLimit-configuration.js # Configuración de límite de peticiones
├── test/                              # Pruebas unitarias e integración
├── server.js                          # Punto de entrada de la aplicación
├── .env.example                       # Plantilla de variables de entorno
└── package.json
```

## 🛡 Seguridad

- Los headers HTTP se protegen con **Helmet**.
- Las contraseñas se almacenan usando **bcrypt** (hash + salt).
- Los tokens se firman con **JWT** e incluyen `issuer` y `audience` para validación adicional.
- Rate limiting activo para mitigar ataques de fuerza bruta.
- El servidor confía en el proxy inverso (`trust proxy`) para funcionar correctamente detrás de balanceadores de carga.

## 🗺 Roadmap

- [x] Conexión a MongoDB con manejo de eventos y cierre elegante
- [x] Configuración base de seguridad (Helmet, CORS, Rate Limit)
- [ ] Endpoints de registro y login
- [ ] Middleware de verificación de JWT
- [ ] Refresh token flow
- [ ] Tests de integración con Supertest
- [ ] Documentación de API (Swagger / OpenAPI)

---

Parte del sistema **SmartAssets** — arquitectura de microservicios para un sistema bancario.
