// Netlify Function que sirve toda la API de Express (backend/app.js).
// netlify.toml redirige /api/* hacia acá.
import serverless from "serverless-http";
import app from "../../backend/app.js";

export const handler = serverless(app, {
  request(req) {
    // Según cómo llegue el pedido, la ruta puede venir como /.netlify/functions/api/...;
    // Express espera /api/...
    req.url = req.url.replace(/^\/\.netlify\/functions\/api/, "/api");
  },
});
