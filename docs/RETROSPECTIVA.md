# Retrospectiva del Proyecto — Guía SG-SST

## Resumen ejecutivo del proyecto

- **Duración:** 10 sprints (17 de marzo al 26 de mayo de 2026)
- **Total de tareas completadas:** 78+ ítems de backlog (SGSST-01 a SGSST-78 + Sprint 9-10)
- **Versiones entregadas:** V1.0 (Sprint 4), V2.0 (Sprint 8), V3.0 Evidencias (Sprints 9-10)
- **Tests automatizados:** 50 tests backend (Jest + Supertest) + 18 tests E2E (Cypress)
- **Funcionalidades principales:** Autenticación JWT, empresa + estimación de riesgo, checklist interactivo con 7 estándares, dashboard con métricas y gráficas (dona, barras, línea, radar), exportación PDF profesional con PDFKit, módulo de evidencias documentales (PDF + imágenes), estado de preparación para inspección

---

## Épicas y su estado final

| Épica | Descripción | Estado |
|-------|-------------|--------|
| SGSST-AUTH | Autenticación JWT + perfil | ✅ Completa |
| SGSST-EMP | Empresa + estimación de riesgo | ✅ Completa |
| SGSST-STD | Estándares + semáforos | ✅ Completa |
| SGSST-CHK | Checklist interactivo | ✅ Completa |
| SGSST-REP | Reportes + gráficas + PDF | ✅ Completa |
| SGSST-INF | Infraestructura + tests | ✅ Completa |
| SGSST-UX | Skeleton + accesibilidad + mobile | ✅ Completa |
| SGSST-EV | Módulo de evidencias documentales | ✅ Completa (Sprints 9-10) |

---

## Lo que funcionó muy bien

- **Prisma ORM** agilizó las migraciones y el tipado sin overhead de configuración.
- **React + Vite** con CSS custom properties: velocidad de desarrollo alta sin dependencias externas como Tailwind.
- **Jest + Supertest con tests runInBand** evitó condiciones de carrera en la base de datos de tests.
- **Chart.js** permitió construir 4 tipos de gráficas interactivas con poca configuración.
- **PDFKit** generó PDFs de calidad profesional desde el servidor sin necesidad de headless browsers.
- La arquitectura routes → controllers → services mantuvo el código desacoplado y testeable.

## Lo que haríamos diferente

- Haber definido el esquema Prisma completo desde el Sprint 1 (el modelo `Evidencia` llegó en Sprint 9 y requirió `db push`).
- Agregar validación con Zod o Joi en los controladores desde el principio.
- Separar la lógica de PDF en su propio servicio desde el inicio en vez de tenerla en el controlador.
- Configurar variables de entorno para los tests (`DATABASE_URL_TEST`) para aislar datos de prueba.
- Definir un contrato de API (OpenAPI) antes de implementar para que frontend y backend trabajen en paralelo con mocks.

---

## Decisiones técnicas clave y por qué

| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| Prisma ORM | Sequelize / TypeORM | Mejor DX, migraciones con schema único, soporte nativo de PostgreSQL |
| multer para uploads | Cloudinary / S3 | Sin dependencias externas, funciona con filesystem local para el scope académico |
| PDFKit (backend) | jsPDF (frontend) | El PDF final es profesional, incluye datos de evidencias del servidor, no expone la lógica |
| CSS custom properties | Tailwind CSS | Sin build adicional, control total de diseño, variables tipadas con semántica de negocio |
| JWT en localStorage | Cookies HTTPOnly | Simplicidad para SPA; en producción real se migraría a cookies seguras |
| Cypress E2E | Playwright | Ecosistema más maduro para React, buena integración con CI/CD |
| express.static para uploads | Endpoint `/descargar` autenticado | Thumbnails de imágenes requieren URL directa; el endpoint de descarga es el canal seguro |

---

## Trabajo futuro (V4 si se continuara)

- **Múltiples empresas por usuario** — para consultores SG-SST que manejan varios clientes
- **Firma digital** de documentos de evidencia con PDF firmado electrónicamente
- **Recordatorios por email** — alertas cuando un estándar lleva más de 30 días sin actualización
- **App móvil** con React Native usando el mismo backend REST
- **Exportar evidencias como ZIP** organizado por estándar
- **Soporte multi-idioma** (español/inglés) con i18n
- **Historial de cambios de empresa** para auditoría de riesgo a lo largo del tiempo
- **Notificaciones push** para cumplimiento de plazos

---

## Métricas finales del proyecto

| Métrica | Valor |
|---------|-------|
| Archivos de código (backend) | ~25 archivos JS |
| Archivos de código (frontend) | ~35 archivos JSX/JS |
| Endpoints API | 20 endpoints |
| Modelos Prisma | 7 modelos (Usuario, Empresa, Estandar, Item, Progreso, ItemProgreso, HistorialProgreso, Evidencia) |
| Tests backend | 50 tests en 4 suites |
| Tests E2E | 18 tests Cypress |
| Sprints completados | 10 |
| Estándares SG-SST implementados | 7 (Resolución 0312 de 2019) |
