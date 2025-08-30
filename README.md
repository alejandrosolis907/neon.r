# NEÓN-R — Railway Ready

Este paquete está listo para desplegar en **Railway**.

## Estructura
```
/
├─ server.js
├─ package.json
└─ frontend/
   ├─ index.html
   ├─ style.css
   ├─ app.js
   └─ (assets, imágenes, etc.)
```

## Ejecutar local
```bash
npm install
npm start
# abre http://localhost:3000
```

## Variables de entorno (opcional)
- `DATABASE_URL`: URL de PostgreSQL. Si no está definida, la ruta `/db/health` responde `not_configured`.
- `PGSSLMODE`: pon `disable` para desactivar SSL (no recomendado en producción).

## Despliegue en Railway
1. Haz push de estos archivos a tu repositorio en GitHub.
2. En Railway: **New Project → Deploy from GitHub** y selecciona el repo.
3. Deja que Nixpacks detecte Node y ejecute `npm start`.
4. Abre el dominio generado. La ruta `/health` debe responder `OK`.
