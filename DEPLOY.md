# Guía de Deploy — SG-SST V2.0

## Requisitos previos
- Cuenta en [Railway](https://railway.app) (backend + PostgreSQL)
- Cuenta en [Vercel](https://vercel.com) (frontend)
- Repositorio en GitHub con el código

---

## Backend en Railway

### Pasos

1. **Crear cuenta** en [railway.app](https://railway.app) y conectar con GitHub.

2. **Nuevo proyecto** → `New Project` → `Deploy from GitHub repo`.

3. **Seleccionar repositorio** y configurar el directorio raíz:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node src/app.js`

4. **Agregar variables de entorno** (en la sección Variables del proyecto):
   ```
   NODE_ENV=production
   JWT_SECRET=<generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
   JWT_EXPIRES_IN=7d
   PORT=3001
   FRONTEND_URL=https://<tu-app>.vercel.app
   ```

5. **Agregar servicio PostgreSQL**:
   - `+ New` → `Database` → `PostgreSQL`
   - Railway crea automáticamente la variable `DATABASE_URL`

6. **Ejecutar migraciones** (desde Railway Shell o localmente con DATABASE_URL de Railway):
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

7. **Deploy automático**: Railway re-deploya con cada push a `main`.

8. **Verificar** en `https://<tu-app>.up.railway.app/api/health`

---

## Frontend en Vercel

### Pasos

1. **Crear cuenta** en [vercel.com](https://vercel.com) y conectar con GitHub.

2. **Import Git Repository** → seleccionar el repositorio del proyecto.

3. **Configurar proyecto**:
   - Framework Preset: `Vite`
   - Root Directory: `FrontEnd/sgsst-fe`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Variables de entorno**:
   ```
   VITE_API_URL=https://<tu-backend>.up.railway.app/api
   ```

5. **Deploy**: Vercel despliega automáticamente en cada push a `main`.

6. **Verificar** en `https://<tu-app>.vercel.app`

---

## GitHub Actions (CI/CD automático)

El archivo `.github/workflows/staging.yml` ejecuta automáticamente:
- Tests del backend con cada push a `main` o `develop`
- Build del frontend si los tests pasan
- Deploy a Railway y Vercel si la rama es `main`

### Secrets necesarios en GitHub:
- `DATABASE_URL_TEST` — URL de la base de datos de pruebas
- `JWT_SECRET` — secreto JWT para tests
- `VITE_API_URL` — URL del backend en producción

---

## Variables de entorno locales

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/sgsst_db
JWT_SECRET=sgsst_dev_secret_2024
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
```

### Frontend (`FrontEnd/sgsst-fe/.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## Comandos útiles

```bash
# Backend
cd backend
npm run dev          # Servidor de desarrollo
npm test             # Tests
npx prisma db push   # Aplicar cambios al schema
node prisma/seed.js  # Sembrar datos iniciales

# Frontend
cd FrontEnd/sgsst-fe
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run test:e2e:open  # Abrir Cypress
npm run test:e2e       # Correr tests E2E headless
```
