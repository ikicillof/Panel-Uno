// Netlify Function que sirve toda la API de Express (backend/app.js) en /api/*.
import { createRequire } from "node:module";
import serverless from "serverless-http";

// backend/app.js es CommonJS: cargándolo con require, Netlify incluye sus dependencias en la función.
const require = createRequire(import.meta.url);
const app = require("../../backend/app.js");

const handler = serverless(app);

// Adapta el Request web de las funciones de Netlify al formato que espera serverless-http.
export default async (req, context) => {
  const url = new URL(req.url);
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const result = await handler(
    {
      httpMethod: req.method,
      path: url.pathname,
      queryStringParameters: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries(req.headers),
      body: hasBody ? Buffer.from(await req.arrayBuffer()).toString("base64") : null,
      isBase64Encoded: hasBody,
    },
    context
  );
  const body = result.isBase64Encoded ? Buffer.from(result.body, "base64") : result.body;
  return new Response(body, { status: result.statusCode, headers: result.headers });
};

export const config = { path: "/api/*" };
