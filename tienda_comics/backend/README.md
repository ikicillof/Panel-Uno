## Deploy en Netlify

El repo ya está preparado (ver `netlify.toml` en la raíz):

- El frontend (Vite) se publica desde `tienda_comics/dist`.
- La API de Express corre como Netlify Function (`tienda_comics/netlify/functions/api.mjs`) en `/api/*`.
- La base de datos es **Netlify Database** (Postgres). La migración
  `tienda_comics/netlify/database/migrations/0001_tienda_comics.sql` es la conversión de
  `Tienda_Comics.sql` + `migrations.sql` + `portadas.sql`, y Netlify la aplica sola en el primer deploy.

Pasos: en app.netlify.com → Add new project → Import from GitHub → elegir Panel-Uno (la
configuración de build se toma del `netlify.toml`). Después, en Project configuration →
Environment variables, cargar `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `GMAIL_USER` y
`GMAIL_APP_PASSWORD` (los mismos valores de `.env`) y volver a deployar.

## Correr en local

La forma más simple es `npx netlify dev` desde `tienda_comics` (levanta frontend, API y un Postgres local).

Sin Netlify CLI: clonas el repo, abris la carpeta tienda_comics y haces npm install ahi,
luego te vas a la carpeta backend que esta dentro de tienda_comics, haces npm install,
pones en backend/.env un DATABASE_URL de un Postgres donde hayas corrido la migración de arriba,
y desde ahi pones node server.js. Por ultimo levantas el frontend desde otra cmd yendo a la carpeta
tienda_comics y poniendo npm run dev (las llamadas a /api se redirigen al backend en el puerto 3001).
