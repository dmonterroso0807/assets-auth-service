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
- [Endpoints](#-endpoints)
- [Modelo de usuario](#-modelo-de-usuario)
- [Seguridad](#-seguridad)
- [Seed de administrador](#-seed-de-administrador)
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

El servicio conecta a MongoDB al arrancar, aplica una capa de middlewares de seguridad (Helmet, CORS, rate limiting) antes de exponer rutas, valida el cuerpo de las peticiones con esquemas Zod, delega la lógica de negocio a servicios independientes de Express, y maneja el cierre elegante de la conexión a base de datos ante señales del sistema (`SIGINT`, `SIGTERM`, `SIGUSR2`).

```
Cliente → Rate Limit → CORS → Helmet → Rutas → Validación (Zod) → Controllers → Services → MongoDB
```

Las rutas protegidas, además, pasan por un middleware de verificación de JWT y, opcionalmente, por uno de autorización por rol (`ADMIN` / `CLIENT`).

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
# Edita .env con tus propios valores (Mongo URI, JWT secret, credenciales de admin, etc.)

# Levantar en modo desarrollo
pnpm run dev
```

El servidor quedará disponible en `http://localhost:3000` (o el puerto que definas en `.env`). Al arrancar, además de conectar a MongoDB, se ejecuta el seed del usuario administrador (ver [Seed de administrador](#-seed-de-administrador)).

## 🔑 Variables de entorno

Estas son las variables que el servicio necesita (ver `.env.example`):

| Variable                 | Descripción                                             |
| ------------------------ | ------------------------------------------------------- |
| `NODE_ENV`               | Entorno de ejecución (`development` / `production`)     |
| `PORT`                   | Puerto en el que escucha el servidor                    |
| `MONGO_URI`              | Cadena de conexión a MongoDB                            |
| `JWT_SECRET`             | Secreto usado para firmar los tokens JWT                |
| `JWT_EXPIRES_IN`         | Tiempo de expiración del access token (ej. `30m`)       |
| `JWT_REFRESH_EXPIRES_IN` | Tiempo de expiración del refresh token (ej. `30d`)      |
| `JWT_ISSUER`             | Emisor del token (claim `iss`)                          |
| `JWT_AUDIENCE`           | Audiencia del token (claim `aud`)                       |
| `ADMIN_USERNAME`         | Username del administrador creado por el seed inicial   |
| `ADMIN_PASSWORD`         | Contraseña del administrador creado por el seed inicial |
| `ADMIN_EMAIL`            | Correo del administrador creado por el seed inicial     |

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
│   ├── config/
│   │   ├── app.js                     # Inicialización del servidor, middlewares y rutas
│   │   └── db.js                      # Conexión a MongoDB y manejo de eventos
│   ├── controllers/
│   │   └── auth-controller.js         # login, refresh-token y manejo estandarizado de errores
│   ├── middlewares/
│   │   ├── auth-middleware.js         # Verificación de access token y autorización por rol
│   │   ├── rateLimit-configuration.js # Rate limit general + rate limit estricto para /login
│   │   └── validate-middleware.js     # Validación de req.body contra esquemas Zod
│   ├── models/
│   │   └── user-model.js              # Schema de usuario (ADMIN / CLIENT)
│   ├── routes/
│   │   └── auth-route.js              # Definición de endpoints públicos de auth
│   ├── schemas/
│   │   └── auth-schema.js             # Esquemas Zod (login, registro, refresh token)
│   ├── services/
│   │   └── auth-service.js            # Lógica de negocio: login, registro, refresh, logout
│   └── utils/
│       ├── apiResponse.util.js        # Helpers ok()/fail() para respuestas consistentes
│       ├── jwt-util.js                # Firma y verificación de access/refresh tokens
│       └── seedAdmin.js               # Crea el usuario administrador si no existe
├── test/                              # Pruebas unitarias e integración
├── server.js                          # Punto de entrada de la aplicación
├── .env.example                       # Plantilla de variables de entorno
└── package.json
```

## 🌐 Endpoints

Todas las respuestas siguen el mismo formato estándar:

```json
// Éxito
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "...", "error": "CODIGO_ERROR", "details": null }
```

| Método | Ruta                            | Descripción                                                       | Protegido                                        |
| ------ | ------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------ |
| GET    | `/health-check`                 | Verifica que el servicio esté arriba                              | No                                               |
| POST   | `/api/auth/login`               | Autentica por `userName` o `email` + `password`                   | No (rate limit estricto: 10 intentos / 15 min)   |
| POST   | `/api/auth/refresh-token`       | Genera un nuevo access token a partir de un refresh token válido  | No                                               |
| POST   | `/api/auth/verify-email`        | Verifica el correo electrónico a partir de `uid` + `token`        | No                                               |
| POST   | `/api/auth/resend-verification` | Reenvía el correo de verificación                                 | No (rate limit general)                          |
| POST   | `/api/auth/register`            | Crea un nuevo cliente (`CLIENT`)                                  | Sí — `ADMIN`, `SUPER_ADMIN`                      |
| GET    | `/api/auth/users`               | Lista los usuarios registrados con datos no sensibles (ver abajo) | Sí — `ADMIN`, `SUPER_ADMIN`                      |
| PATCH  | `/api/auth/users/:id`           | Actualiza campos editables de una cuenta                          | Sí — dueño de la cuenta, `ADMIN` o `SUPER_ADMIN` |
| PATCH  | `/api/auth/users/:id/role`      | Cambia el rol de un usuario                                       | Sí — `SUPER_ADMIN`                               |

Códigos de error más comunes: `INVALID_CREDENTIALS`, `USER_INACTIVE`, `VALIDATION_ERROR`, `MISSING_TOKEN`, `TOKEN_EXPIRED`, `INVALID_TOKEN`, `INVALID_TOKEN_TYPE`, `FORBIDDEN`, `RATE_LIMIT_EXCEEDED` / `LOGIN_RATE_LIMIT_EXCEEDED`, `INTERNAL_ERROR`.

### 📄 `GET /api/auth/users` — Listado de usuarios

Devuelve únicamente los campos considerados necesarios y no sensibles para un listado administrativo. **No se expone `_id`, `password`, `dpi`, `phone`, `address`, `jobName`, `monthlyIncome`, `refreshTokens` ni los tokens de verificación de correo**, para evitar filtrar información que pueda comprometer a los usuarios o a la plataforma.

```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "role": "CLIENT",
      "name": "Juan Pérez",
      "userName": "jperez",
      "email": "juan@example.com",
      "status": true
    }
  ]
}
```

## 👤 Modelo de usuario

El modelo `User` soporta dos roles, `ADMIN` y `CLIENT`, con campos condicionalmente obligatorios según el rol:

- **Comunes:** `role`, `name`, `userName` (único), `email` (único), `password` (hasheado, no se retorna por defecto), `status`, `refreshTokens` (no se retorna por defecto).
- **Solo para `CLIENT`:** `dpi` (único, inmutable), `address`, `phone`, `jobName`, `monthlyIncome` (mínimo Q100).
- `accountNumber` se genera automáticamente y de forma única al crear un cliente.

## 🛡 Seguridad

- Los headers HTTP se protegen con **Helmet**.
- Las contraseñas se almacenan usando **bcrypt** (hash + salt, 12 rounds).
- Los tokens se firman con **JWT** e incluyen `issuer` y `audience` para validación adicional; el access token y el refresh token usan tiempos de expiración distintos.
- Los refresh tokens se persisten por usuario para poder revocarlos individualmente en el logout.
- Rate limiting general para toda la API y uno más estricto específicamente en `/login` para mitigar ataques de fuerza bruta contra credenciales.
- Middleware de autorización por rol (`authorizeRoles`) para restringir endpoints administrativos.
- Mensajes de error genéricos en fallos de login (no se revela si falló el usuario o la contraseña) para mitigar user enumeration.
- El servidor confía en el proxy inverso (`trust proxy`) para funcionar correctamente detrás de balanceadores de carga.

## 🌱 Seed de administrador

Al iniciar el servidor (antes de levantar Express), se ejecuta `seedAdmin()`, que crea automáticamente un usuario `ADMIN` si no existe uno con el `ADMIN_USERNAME` configurado. Esto garantiza que siempre haya una cuenta administrativa disponible para gestionar el sistema desde el primer arranque.

## 🗺 Roadmap

- [x] Conexión a MongoDB con manejo de eventos y cierre elegante
- [x] Configuración base de seguridad (Helmet, CORS, Rate Limit)
- [x] Endpoint de login con JWT
- [x] Middleware de verificación de JWT y autorización por rol
- [x] Refresh token flow
- [x] Seed automático de usuario administrador
- [x] Endpoint de registro de clientes
- [x] Verificación de correo electrónico
- [x] Listado de usuarios con datos no sensibles (`GET /api/auth/users`)
- [ ] Endpoint de logout
- [ ] Tests de integración con Supertest
- [ ] Documentación de API (Swagger / OpenAPI)

---

Parte del sistema **SmartAssets** — arquitectura de microservicios para un sistema bancario.
