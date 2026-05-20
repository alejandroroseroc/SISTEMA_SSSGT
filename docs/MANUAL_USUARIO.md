# Manual de Usuario — Guía SG-SST

## ¿Qué es esta aplicación?

La Guía SG-SST es una herramienta web gratuita para microempresas colombianas que te ayuda a cumplir con los **Estándares Mínimos del Sistema de Gestión de Seguridad y Salud en el Trabajo** exigidos por la **Resolución 0312 de 2019** del Ministerio del Trabajo.

---

## Primeros pasos

### 1. Crear tu cuenta
1. Ve a la página principal
2. Haz clic en **"Registrarme gratis"**
3. Ingresa tu nombre, correo y contraseña
4. Haz clic en **"Crear cuenta"**

### 2. Configurar tu empresa
La aplicación necesita los datos de tu empresa para calcular el nivel de riesgo correcto.

1. Ve a **Configurar empresa** (aparece automáticamente)
2. Ingresa:
   - Nombre de la empresa
   - Actividad económica (ej: comercio, manufactura, servicios)
   - Número de trabajadores
   - Ciudad
3. Haz clic en **"Guardar"**

El sistema calculará automáticamente tu nivel de riesgo (I a V según el número de trabajadores y la actividad).

---

## Completar el checklist SG-SST

### Ver los 7 estándares
1. Ve al menú **"Estándares"**
2. Verás 7 tarjetas, una por cada estándar de la Resolución 0312
3. Cada tarjeta muestra:
   - El porcentaje de cumplimiento actual (barra de progreso)
   - Un semáforo: ✅ Completado / 🟡 En progreso / 🔴 Sin iniciar
   - El número de documentos de evidencia subidos (📁 X docs)

### Completar los ítems
1. Haz clic en cualquier estándar
2. Verás la lista de ítems de verificación
3. Marca los ítems que ya tienes implementados con el checkbox
4. El sistema guarda automáticamente (aparece "✓ Guardado")
5. La barra de progreso se actualiza en tiempo real

---

## Cómo subir documentos de evidencia

El SG-SST exige que guardes los documentos que demuestran lo que hiciste. Por ejemplo, si designaste un responsable, debes guardar la carta o acta firmada.

### Pasos para subir un documento
1. Ve a **"Estándares"** en el menú
2. Haz clic en el estándar al que pertenece el documento
3. Baja hasta la sección **"Evidencias documentales"**
4. Escribe un nombre descriptivo para el documento (ej: "Carta de designación COPASST")
5. Haz clic en el campo de archivo y selecciona tu documento
6. Haz clic en **"⬆ Subir PDF"**
7. El documento aparecerá en la lista

### Tipos de archivo aceptados
- **PDF** (recomendado para actas, certificados, registros)
- **JPG / PNG** (para fotos de señalización, elementos de protección, etc.)
- Tamaño máximo: **10 MB** por archivo

### Ver todos tus documentos
Ve a **"Evidencias"** en el menú principal para ver todos los documentos organizados. Puedes filtrar por estándar.

### ¿Dónde quedan mis documentos?
Los documentos quedan guardados en el servidor y aparecen:
- En la sección de evidencias de cada estándar
- En el reporte ejecutivo (JSON y PDF)
- En la página "Mis evidencias"

### Preguntas frecuentes
- **¿Puedo subir varios documentos por estándar?** Sí, puedes subir los que necesites
- **¿Puedo eliminar un documento?** Sí, con el botón ✕ en la lista
- **¿Mis documentos aparecen en el PDF?** Sí, el PDF incluye una sección con todos los archivos subidos

---

## Ver tu progreso

### Dashboard
El Dashboard muestra:
- **Porcentaje de cumplimiento global** (promedio de los 7 estándares)
- **4 estadísticas**: total, completados, en progreso, sin iniciar
- **Estado de preparación**: qué falta para estar listo ante una inspección
- **Continúa donde quedaste**: el estándar con avance parcial
- **Avance por estándar**: cuadrícula con semáforo
- **Pendientes urgentes**: los 3 estándares más atrasados

### Mi progreso
Ve a **"Mi progreso"** para ver:
- Estadísticas de actividad (días activo, semana más productiva)
- Gráfica de actividad en los últimos 14 días
- Línea de tiempo de acciones recientes

---

## Reporte ejecutivo

### Ver el reporte en pantalla
1. Ve a **"Reportes"** en el menú
2. Verás el reporte completo con:
   - 4 tarjetas métricas (cumplimiento, estándares, ítems, evidencias)
   - Tabla de cumplimiento por estándar con indicador de evidencias
   - Gráficas: dona, barras, evolución, radar
   - Acciones pendientes críticas
   - Lista de evidencias documentales

### Descargar el PDF
1. En la página de reportes, haz clic en **"⬇️ Descargar PDF"**
2. El PDF incluye:
   - Portada con nombre de la empresa
   - Datos de la empresa y nivel de riesgo
   - Resumen de cumplimiento con porcentaje global
   - Tabla de cumplimiento por estándar
   - Pendientes críticos
   - Recomendaciones automáticas
   - Lista de documentos de evidencia por estándar
   - Nota legal y número de página

### Informe ARL
El botón **"📄 Informe ARL"** descarga un archivo de texto con el resumen de cumplimiento para presentar a tu ARL.

---

## Estado de preparación para inspección

En el Dashboard, la sección **"Estado de preparación para inspección"** te muestra:

**Si estás listo (✅):**
- Todos los ítems del checklist completados
- Al menos 1 documento de evidencia por cada estándar
- Botón directo para descargar el reporte

**Si aún no estás listo:**
- Checklist: cuántos estándares tienen todos sus ítems marcados
- Evidencias: cuántos estándares tienen al menos 1 documento
- Estimado de pasos restantes

---

## Preguntas frecuentes

**¿Qué pasa si no tengo empresa registrada?**
La mayoría de funciones requieren empresa. Ve a "Configurar empresa" para registrar tus datos.

**¿Puedo cambiar los datos de mi empresa?**
Sí. Ve a "Configurar empresa" y modifica los campos. Los cambios se guardan al hacer clic en "Guardar".

**¿Los datos son privados?**
Sí. Cada usuario solo ve los datos de su propia empresa. La autenticación es por JWT con expiración.

**¿Qué es el nivel de riesgo I-V?**
Es la clasificación de tu empresa según la Resolución 0312:
- Nivel I: 10 o menos trabajadores, riesgo I o II
- Nivel II: 11 a 50 trabajadores, riesgo I o II
- Nivel III: 11 a 50 trabajadores, riesgo III, IV o V
- Nivel IV: 51 a 200 trabajadores, cualquier riesgo
- Nivel V: más de 200 trabajadores

**¿Puedo acceder desde el celular?**
Sí. La aplicación funciona en celulares (390px de ancho o más) con un menú hamburguesa adaptado.
