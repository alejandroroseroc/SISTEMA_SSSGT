# Checklist Version 2.0 — Guía SG-SST

## Funcionalidades V2

- [x] Gráfica de dona en reportes
- [x] Gráfica de barras comparativa
- [x] Gráfica de línea de evolución
- [x] Gráfica de radar (spider)
- [x] Reporte ejecutivo completo (/reporte-ejecutivo)
- [x] Exportar PDF funcional (POST /api/reportes/pdf)
- [x] Informe formato ARL (POST /api/reportes/arl)
- [x] Dashboard ejecutivo mejorado (saludo, barra prominente, FAB)
- [x] Línea de tiempo en Mi Progreso (/mi-progreso)
- [x] Indicadores semáforo en estándares
- [x] Notificaciones de pendientes con prioridad
- [x] Edición de perfil de usuario (/perfil)
- [x] Edición de empresa (Onboarding con modo edición)

## Testing

- [x] 32 tests unitarios/integración backend pasando
- [x] Tests de integración reportes (7 tests) pasando
- [x] Tests E2E API completos (15 tests) pasando
- [ ] Tests E2E Cypress frontend (requiere servidores corriendo)
- [ ] Pruebas en mobile (iPhone y Android) — requiere dispositivo o emulador

## Deploy Staging

- [ ] Backend desplegado en Railway
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] HTTPS funcionando
- [ ] URL pública funcional

## Documentación

- [x] Swagger docs en /api/docs
- [x] DEPLOY.md con instrucciones paso a paso
- [x] CHECKLIST_V2.md con estado del proyecto
- [ ] README actualizado con URL de staging

## Detalles técnicos V2

### Backend
- Índices de BD añadidos (Sprint 7): `@@index` en Progreso, HistorialProgreso, Item, ItemProgreso
- Endpoint GET /api/reportes/ejecutivo — reporte completo en 1 query
- Endpoint POST /api/reportes/pdf — descarga PDF
- Endpoint POST /api/reportes/arl — informe ARL
- Paginación en historial: `{ok, data: {items, paginacion}}`
- Validación: ítems de progreso pertenecen al estándar indicado
- Swagger/OpenAPI 3.0 en /api/docs

### Frontend
- 4 gráficas con Chart.js: Radar, Dona, Barras, Línea
- Componentes Skeleton y EmptyState para mejor UX
- Navbar responsive con menú hamburguesa (mobile)
- Onboarding con modo creación y edición
- Mensaje "Sesión expirada" al recibir 401
- ARIA attributes en barras de progreso y alerts
- CSS responsive: 1 columna en mobile, 2 en tablet, 3+ en desktop
