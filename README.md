# Guía SG-SST — Sistema de Gestión de Seguridad y Salud en el Trabajo

Aplicación web para microempresas colombianas que facilita el cumplimiento de los **Estándares Mínimos del SG-SST** según la **Resolución 0312 de 2019** del Ministerio del Trabajo.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 8 + CSS custom properties |
| Backend | Node.js + Express 5 |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Uploads | multer |
| PDF | PDFKit (backend) |
| Gráficas | Chart.js + react-chartjs-2 |
| Tests BE | Jest + Supertest |
| Tests E2E | Cypress 15 |

## Funcionalidades principales

- 🔐 **Autenticación JWT** — registro, login, sesión segura con expiración
- 🏢 **Gestión de empresa** — registro de datos y estimación automática del nivel de riesgo (I–V)
- 📋 **Checklist interactivo** — 7 estándares SG-SST con ítems de verificación y guardado automático
- 📊 **Dashboard ejecutivo** — métricas en tiempo real, semáforo de cumplimiento, estado de preparación para inspección
- 📈 **Reportes con gráficas** — dona, barras, línea (30 días) y radar de 7 ejes
- 📄 **Exportación PDF profesional** — reporte ejecutivo con portada, tablas, pendientes, recomendaciones y pie de página
- 📁 **Módulo de evidencias** — sube PDFs e imágenes como respaldo documental de cada estándar. Los documentos quedan vinculados al estándar correspondiente, aparecen en el reporte de cumplimiento y son descargables en cualquier momento.
- 📱 **Responsive** — funciona en desktop y mobile (390px+)
- ♿ **Accesibilidad** — ARIA labels, focus-visible, semáforo de colores

## Endpoints API

### Auth
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Perfil del usuario | ✅ |

### Empresa
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/empresa` | Crear empresa | ✅ |
| GET | `/api/empresa/mi` | Ver mi empresa | ✅ |
| PUT | `/api/empresa/:id` | Actualizar empresa | ✅ |

### Estándares
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/estandares` | Listar 7 estándares (con conteo de evidencias) | ✅ |
| GET | `/api/estandares/:id` | Detalle del estándar | ✅ |

### Progreso
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/progreso/:estandarId` | Estado del checklist | ✅ |
| PUT | `/api/progreso/:estandarId` | Guardar checklist | ✅ |

### Reportes
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/reportes/cumplimiento` | Resumen de cumplimiento | ✅ |
| GET | `/api/reportes/historial` | Historial paginado | ✅ |
| GET | `/api/reportes/notificaciones` | Pendientes urgentes | ✅ |
| GET | `/api/reportes/ejecutivo` | Reporte ejecutivo JSON | ✅ |
| POST | `/api/reportes/pdf` | Descargar PDF ejecutivo | ✅ |
| POST | `/api/reportes/arl` | Informe ARL en texto | ✅ |

### Evidencias
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/evidencias` | Subir documento (PDF/JPG/PNG) | ✅ |
| GET | `/api/evidencias` | Listar todas | ✅ |
| GET | `/api/evidencias/estandar/:id` | Por estándar | ✅ |
| GET | `/api/evidencias/:id/descargar` | Descargar archivo | ✅ |
| DELETE | `/api/evidencias/:id` | Eliminar | ✅ |

## Instalación y ejecución

### Backend
```bash
cd backend
cp .env.example .env   # Configurar DATABASE_URL y JWT_SECRET
npm install
npx prisma db push
npm run seed
npm run dev            # http://localhost:3001
```

### Frontend
```bash
cd FrontEnd/sgsst-fe
npm install
npm run dev            # http://localhost:5173
```

### Tests
```bash
# Backend (50 tests)
cd backend && npm test

# E2E (Cypress — requiere servidores corriendo)
cd FrontEnd/sgsst-fe && npm run test:e2e
```

## Documentación API

Disponible en `http://localhost:3001/api/docs` (Swagger UI).

## Variables de entorno requeridas

```
DATABASE_URL=postgresql://user:password@localhost:5432/sgsst_db
JWT_SECRET=tu_secreto_seguro
PORT=3001
NODE_ENV=development
```
