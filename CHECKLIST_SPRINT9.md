# Checklist Sprint 9 — Evidencias y PDF Profesional

## Backend

### PDF Ejecutivo mejorado
- [ ] POST /api/reportes/pdf devuelve 200 con Content-Type: application/pdf
- [ ] El PDF contiene portada con fondo verde y título en blanco
- [ ] El PDF muestra datos de la empresa (nombre, ciudad, nivel de riesgo)
- [ ] El PDF muestra el % de cumplimiento global con color semáforo
- [ ] El PDF incluye tabla de cumplimiento por estándar con columna de evidencias
- [ ] El PDF muestra sección "Pendientes críticos" con cajas rojas
- [ ] El PDF incluye sección de Recomendaciones generadas automáticamente
- [ ] El PDF tiene nota legal al pie
- [ ] El PDF tiene número de página en el pie de cada hoja
- [ ] El PDF se abre correctamente en Preview / Adobe Reader

### Módulo de Evidencias
- [ ] POST /api/evidencias sube un PDF correctamente (multipart/form-data)
- [ ] POST /api/evidencias rechaza archivos que no sean PDF → 400
- [ ] POST /api/evidencias rechaza archivos > 10 MB → 400
- [ ] POST /api/evidencias rechaza sin token → 401
- [ ] GET /api/evidencias lista todas las evidencias de la empresa → 200
- [ ] GET /api/evidencias?estandarId=1 filtra por estándar correctamente
- [ ] GET /api/evidencias/:id/descargar descarga el archivo PDF → 200
- [ ] GET /api/evidencias/:id/descargar rechaza acceso cruzado entre empresas → 403
- [ ] DELETE /api/evidencias/:id elimina la evidencia y el archivo del disco → 200
- [ ] DELETE /api/evidencias/99999 devuelve 404 si no existe

### Tests
- [ ] `npm test` pasa los 40 tests (incluidos 8 de evidencias)
- [ ] No hay errores de conexión ni handles abiertos

## Frontend

### EvidenciasPanel (EstandarDetalle)
- [ ] El panel aparece en la página de detalle de cada estándar
- [ ] Se muestra el formulario de carga con campo de nombre y selector de PDF
- [ ] Al seleccionar un archivo que no es PDF → muestra error en el formulario
- [ ] Al subir un PDF válido → aparece en la lista sin recargar la página
- [ ] La lista muestra nombre, tamaño y fecha de cada evidencia
- [ ] El botón ↓ descarga el archivo correctamente
- [ ] El botón ✕ pide confirmación y elimina la evidencia de la lista
- [ ] El panel es usable en viewport mobile (390px)

### ReporteEjecutivo
- [ ] La tarjeta "Evidencias" muestra el número total de documentos subidos
- [ ] La tabla de cumplimiento tiene columna "Evidencias" con el conteo por estándar
- [ ] La sección "Evidencias documentales" aparece al final del reporte
- [ ] Si no hay evidencias → muestra alerta informativa
- [ ] Si hay evidencias → muestra tabla con nombre, estándar, tamaño, fecha
- [ ] Botón "Descargar PDF" descarga el reporte mejorado correctamente

## Prueba integral (golden path)

1. Registrar usuario nuevo → crear empresa → guardar progreso en al menos 2 estándares
2. Ir a Estándar 1 → subir un PDF → verificar que aparece en la lista
3. Ir a Estándar 2 → subir otro PDF
4. Ir a Reporte Ejecutivo → verificar que la tarjeta Evidencias muestra 2
5. Verificar columna Evidencias en la tabla de cumplimiento
6. Verificar sección Evidencias documentales con los 2 archivos
7. Descargar PDF → abrir y verificar portada, tabla, pendientes y pie de página
8. Eliminar una evidencia → verificar que se actualiza el conteo
