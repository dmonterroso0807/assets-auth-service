# 🏦 smart-assets

Sistema bancario basado en **microservicios** — autenticación, cuentas y transacciones con Node.js, Express y MongoDB.

Este repositorio es un **monorepo**: cada microservicio vive en su propia carpeta, con su propio `package.json`, dependencias y ciclo de despliegue independiente.

## 📋 Tabla de contenido

- [Arquitectura](#-arquitectura)
- [Servicios](#-servicios)
- [Stack general](#-stack-general)
- [Estructura del monorepo](#-estructura-del-monorepo)
- [Cómo empezar](#-cómo-empezar)
- [Convenciones](#-convenciones)
- [Roadmap](#-roadmap)

## 🏗 Arquitectura

Cada servicio es independiente, expone su propia API REST y su propia base de datos (o colección dedicada), y se comunica con los demás mediante HTTP. La autenticación es centralizada: los demás servicios validan el JWT emitido por `auth-service` para proteger sus propios endpoints.

```
Cliente
  │
  ▼
auth-service   →  emite y valida JWT (login, refresh token)
  │
  ▼
(futuro) accounts-service, transactions-service, ...
```

## 🧩 Servicios

| Servicio        | Descripción                                              | Estado         |
| ---------------- | --------------------------------------------------------- | -------------- |
| [`auth-service`](./auth-service) | Registro, login, emisión y validación de JWT para el resto del sistema | 🟢 En desarrollo |
| `accounts-service`   | Gestión de cuentas bancarias de clientes                  | ⚪ Planeado     |
| `transactions-service` | Depósitos, retiros y transferencias entre cuentas          | ⚪ Planeado     |

Cada servicio tiene su propio README con detalles de instalación, endpoints y variables de entorno específicas — ver [`auth-service/README.md`](./auth-service/README.md).

## 🛠 Stack general

| Categoría          | Tecnología                       |
| ------------------ | --------------------------------- |
| Runtime            | Node.js (ESM)                    |
| Framework          | Express 5                        |
| Base de datos      | MongoDB + Mongoose               |
| Autenticación      | JSON Web Tokens (jsonwebtoken)   |
| Hashing            | bcrypt                           |
| Validación         | Zod                                |
| Seguridad HTTP     | Helmet, CORS, express-rate-limit |
| Logging            | Morgan                           |
| Testing            | Jest + Supertest                 |
| Linting            | ESLint                           |
| Gestor de paquetes | pnpm                              |

## 📁 Estructura del monorepo

```
smart-assets/
├── auth-service/          # Autenticación y autorización (JWT)
│   └── README.md
├── accounts-service/       # (planeado)
├── transactions-service/   # (planeado)
└── README.md               # Este archivo
```

## 🚀 Cómo empezar

```bash
# Clonar el monorepo
git clone https://github.com/dmonterroso0807/smart-assets.git
cd smart-assets

# Entrar al servicio que quieras levantar
cd auth-service
pnpm install
cp .env.example .env
pnpm run dev
```

Cada servicio corre en su propio puerto y se levanta de forma independiente — no hay un único comando que levante todo el sistema (por ahora).

## 📐 Convenciones

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `docs`, `chore`, etc.), en español, con scope del servicio afectado. Ej: `feat(auth): implementar login con JWT y manejo de refresh tokens.`
- **Ramas:** `tipo/descripcion-corta` (ej. `feat/auth-login-jwt`), mergeadas a `main` vía Pull Request.
- **Respuestas de API:** todos los servicios devuelven un formato estándar:
  ```json
  // Éxito
  { "success": true, "message": "...", "data": { ... } }

  // Error
  { "success": false, "message": "...", "error": "CODIGO_ERROR", "details": null }
  ```

## 🗺 Roadmap

- [x] `auth-service`: conexión a MongoDB, seguridad base (Helmet, CORS, rate limit)
- [x] `auth-service`: login con JWT y refresh tokens
- [ ] `auth-service`: registro de clientes y logout
- [ ] `accounts-service`
- [ ] `transactions-service`
- [ ] Documentación de API (Swagger / OpenAPI) por servicio
- [ ] CI/CD por servicio

---

Sistema bancario de microservicios — proyecto en desarrollo activo.
