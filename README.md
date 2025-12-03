<div align="center">

# 🎨 DesignOS

### AI Design System Toolkit

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/carloscastrofr-oss/emi)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-Platform-4285F4?logo=googlecloud)](https://cloud.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?logo=google)](https://ai.google.dev/)

**Sistema integral de gestión de diseño potenciado por IA para equipos de producto**

[Documentación](#-documentación) •
[Módulos](#-módulos) •
[Tech Stack](#-tech-stack) •
[Instalación](#-instalación)

</div>

---

## 📋 Descripción

**DesignOS** es una plataforma integral que permite a equipos de diseño y producto gestionar, colaborar y acelerar el desarrollo de sistemas de diseño. Combina gestión de recursos, generación de contenido con IA, automatización de flujos, y herramientas colaborativas de gobernanza en un solo ecosistema.

### ✨ Características Principales

- 🤖 **Generación con IA** - Copy, microcopy y flujos de usuario generados con Gemini AI
- 📁 **Gestión de Recursos** - Centraliza documentos, guidelines y assets de diseño
- 📋 **Backlog de Diseño** - Sistema de solicitudes y aprobación de tareas
- 🎯 **Estrategia de DS** - Genera estrategias completas de Design System con IA
- 👥 **Multi-tenant** - Arquitectura de clientes y workspaces aislados
- 🔐 **Control de Acceso** - Sistema de roles granular por workspace

---

## 📚 Documentación

| Documento                                   | Descripción                                                          |
| ------------------------------------------- | -------------------------------------------------------------------- |
| [📘 Requerimientos](docs/requerimientos.md) | Especificación funcional completa, requisitos, arquitectura y flujos |
| [📋 Tasks](docs/tasks.md)                   | Tareas estructuradas por módulos con estimaciones                    |
| [📐 Blueprint](docs/blueprint.md)           | Diseño inicial y features core del producto                          |

---

## 🧩 Módulos

| Módulo             | Descripción                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| 🔐 **Auth**        | Autenticación con Google Identity Platform, sistema de roles y permisos por workspace |
| 👤 **Admin Panel** | Gestión de clientes, workspaces, usuarios e invitaciones por link                     |
| 📁 **Kit**         | Gestor de recursos de diseño: documentos, URLs, categorías con búsqueda               |
| ✍️ **AI Writing**  | Generación de copy y microcopy con Gemini AI, conexión con recursos de Kit            |
| 🔀 **AI Flow**     | Generación de flujos de usuario en formato JSON compatible con Figma                  |
| 📋 **Workbench**   | Sistema de solicitudes, backlog, aprobaciones y gestión de tareas                     |
| 🎯 **Strategy**    | Generación de estrategias completas de Design System con IA                           |

---

## 🛠 Tech Stack

### Frontend

| Tecnología                                      | Uso                            |
| ----------------------------------------------- | ------------------------------ |
| [Next.js 15](https://nextjs.org/)               | Framework React con App Router |
| [React 18](https://react.dev/)                  | UI Library                     |
| [TypeScript](https://www.typescriptlang.org/)   | Type Safety                    |
| [Tailwind CSS](https://tailwindcss.com/)        | Styling                        |
| [shadcn/ui](https://ui.shadcn.com/)             | Component Library              |
| [Radix UI](https://www.radix-ui.com/)           | Primitives accesibles          |
| [Framer Motion](https://www.framer.com/motion/) | Animaciones                    |
| [Zustand](https://zustand-demo.pmnd.rs/)        | State Management               |
| [Zod](https://zod.dev/)                         | Schema Validation              |

### Backend / Cloud

| Tecnología                                                             | Uso                        |
| ---------------------------------------------------------------------- | -------------------------- |
| [Google Cloud Platform](https://cloud.google.com/)                     | Infraestructura Cloud      |
| [Google Identity Platform](https://cloud.google.com/identity-platform) | Autenticación              |
| [AlloyDB](https://cloud.google.com/alloydb)                            | Base de datos PostgreSQL   |
| [Cloud Firestore](https://firebase.google.com/docs/firestore)          | Configuraciones y settings |
| [Cloud Storage](https://cloud.google.com/storage)                      | Almacenamiento de archivos |
| [Cloud Run](https://cloud.google.com/run)                              | Deployment serverless      |

### IA / ML

| Tecnología                                                 | Uso                     |
| ---------------------------------------------------------- | ----------------------- |
| [Gemini API](https://ai.google.dev/)                       | Modelo de IA generativa |
| [Firebase Genkit](https://firebase.google.com/docs/genkit) | Framework de agentes IA |
| [Mammoth.js](https://github.com/mwilliamson/mammoth.js)    | Procesamiento de Word   |
| [PDF.js](https://mozilla.github.io/pdf.js/)                | Procesamiento de PDFs   |

### DevOps

| Tecnología                                            | Uso     |
| ----------------------------------------------------- | ------- |
| [GitHub Actions](https://github.com/features/actions) | CI/CD   |
| [Pino](https://getpino.io/)                           | Logging |

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Google Cloud Platform
- Firebase project configurado

### Setup

1. **Clonar el repositorio**

```bash
git clone https://github.com/carloscastrofr-oss/emi.git
cd emi
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# AlloyDB (producción)
DATABASE_URL=postgresql://...
```

4. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📜 Scripts Disponibles

| Script                 | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Inicia servidor de desarrollo            |
| `npm run build`        | Compila para producción                  |
| `npm run lint`         | Ejecuta ESLint en todo el proyecto       |
| `npm run lint:fix`     | Ejecuta ESLint y corrige automáticamente |
| `npm run format`       | Formatea código con Prettier             |
| `npm run format:check` | Verifica formato sin modificar           |
| `npm run typecheck`    | Verifica tipos de TypeScript             |
| `npm run genkit:dev`   | Inicia Genkit para desarrollo de IA      |

---

## 🛡️ Calidad de Código

Este proyecto usa **ESLint + Prettier** para mantener código de alta calidad y formato consistente.

| Herramienta | Propósito                       | Config                 |
| ----------- | ------------------------------- | ---------------------- |
| ESLint      | Calidad de código, bugs, reglas | `eslint.config.mjs`    |
| Prettier    | Formateo consistente            | `.prettierrc`          |
| Husky       | Git hooks automáticos           | `.husky/`              |
| lint-staged | Lint solo en archivos staged    | `package.json`         |
| commitlint  | Validar mensajes de commit      | `commitlint.config.js` |

> ⚡ **Pre-commit hooks:** Al hacer commit, automáticamente se ejecuta ESLint + Prettier en todo el proyecto.

---

## 📝 Convenciones de Commits

Este proyecto sigue [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial limpio y facilitar el versionado semántico.

> ⚡ **Validación automática:** Los commits son validados automáticamente con [Husky](https://typicode.github.io/husky/) + [commitlint](https://commitlint.js.org/). Commits que no sigan el formato serán rechazados.

### Formato

```
<tipo>: <descripción>
```

### Tipos de Commit

| Tipo       | Descripción                               | Ejemplo                                  |
| ---------- | ----------------------------------------- | ---------------------------------------- |
| `feat`     | Nueva funcionalidad                       | `feat: add drag and drop file upload`    |
| `fix`      | Corrección de bug                         | `fix: resolve token expiration issue`    |
| `docs`     | Cambios en documentación                  | `docs: update installation steps`        |
| `style`    | Formato, espacios (sin cambios de lógica) | `style: fix button indentation`          |
| `refactor` | Refactorización sin cambiar funcionalidad | `refactor: simplify error handling`      |
| `perf`     | Mejoras de rendimiento                    | `perf: optimize search query with index` |
| `test`     | Agregar o corregir tests                  | `test: add task filter tests`            |
| `build`    | Cambios en build o dependencias           | `build: upgrade next.js to 15.1`         |
| `ci`       | Configuración de CI/CD                    | `ci: add deploy workflow`                |
| `chore`    | Mantenimiento general                     | `chore: update seed data script`         |

### Ejemplos

```bash
# Feature nuevo
feat: add tone selection dropdown

# Bug fix con referencia a issue
fix: prevent duplicate task submissions

Closes #123

# Breaking change
feat!: change auth endpoint response format

BREAKING CHANGE: /api/auth/login now returns different structure
```

### Reglas

- ✅ Usar imperativo: `add feature` no `added feature`
- ✅ Primera letra minúscula en descripción
- ✅ Sin punto final
- ✅ Máximo 72 caracteres en primera línea
- ❌ No usar: `wip`, `misc`, `update`, `changes`

---

## 👥 Roles de Usuario

| Rol                     | Permisos                                                                 |
| ----------------------- | ------------------------------------------------------------------------ |
| **Super Admin**         | Acceso global a todo el sistema, gestión de clientes y workspaces        |
| **Admin de Cliente**    | Gestión de su cliente específico y workspaces asociados                  |
| **Product Design Lead** | Aprobación de tareas, generación de invitaciones, supervisión de calidad |
| **Product Designer**    | Uso completo de módulos de diseño y generación con IA                    |
| **UX/UI Designer**      | Uso de herramientas de diseño y recursos del sistema                     |

---

## 📄 Licencia

Copyright © 2025 [Multiplica](https://www.multiplica.com/). Todos los derechos reservados.

---

<div align="center">

**Desarrollado con ❤️ por el equipo de Multiplica**

[Repositorio](https://github.com/carloscastrofr-oss/emi) • [Website](https://www.multiplica.com/) • [LinkedIn](https://www.linkedin.com/company/multiplica/)

</div>
