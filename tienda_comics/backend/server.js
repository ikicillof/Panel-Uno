require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

// ── Mercado Pago (sandbox) ─────────────────────────────────────────────────
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// ── Login por token enviado a gmail ────────────────────────────────────────
const ADMIN_EMAIL = "ikicillof@gmail.com";
const TOKEN_TTL_MS = 10 * 60 * 1000; // el código vence a los 10 minutos
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // la sesión dura 7 días

const pendingTokens = new Map(); // email -> { code, expiresAt }
const resetTokens = new Map();   // email -> { code, expiresAt } (código de "olvidé mi contraseña", separado del de login)
const sessions = new Map();      // sessionToken -> { userId, email, isAdmin, expiresAt }

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function cleanupExpired(map) {
  const now = Date.now();
  for (const [key, value] of map) {
    if (value.expiresAt < now) map.delete(key);
  }
}

function getSessionFromReq(req) {
  cleanupExpired(sessions);
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  return sessions.get(token) || null;
}

function requireAdmin(req, res, next) {
  const session = getSessionFromReq(req);
  if (!session) return res.status(401).json({ error: "No autenticado" });
  if (!session.isAdmin) return res.status(403).json({ error: "No autorizado" });
  req.session = session;
  next();
}

function requireSession(req, res, next) {
  const session = getSessionFromReq(req);
  if (!session) return res.status(401).json({ error: "No autenticado" });
  req.session = session;
  next();
}

// Genera y envía el código de 6 dígitos (segundo factor, tras validar contraseña).
async function sendLoginCode(email) {
  cleanupExpired(pendingTokens);
  const code = generateCode();
  pendingTokens.set(email, { code, expiresAt: Date.now() + TOKEN_TTL_MS });
  await mailTransport.sendMail({
    from: `"Panel Uno" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Tu código de acceso — Panel Uno",
    text: `Tu código de acceso es: ${code}\n\nVence en 10 minutos. Si no lo pediste vos, ignorá este mail.`,
    html: `<p>Tu código de acceso a <b>Panel Uno</b> es:</p><h1 style="letter-spacing:0.2em">${code}</h1><p>Vence en 10 minutos. Si no lo pediste vos, ignorá este mail.</p>`,
  });
}

// ── POST /api/auth/register ────────────────────────────────────────────────
// Crea la cuenta (gmail + contraseña hasheada) y manda el código de 6 dígitos.
app.post("/api/auth/register", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!isValidEmail(email)) return res.status(400).json({ error: "Email inválido" });
  if (password.length < 6) return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

  try {
    const existing = await query("SELECT Id_Usuario FROM Usuarios WHERE Gmail = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ error: "Ya existe una cuenta vinculada a ese gmail. Iniciá sesión en cambio." });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.execute("INSERT INTO Usuarios (Gmail, Password_Hash) VALUES (?, ?)", [email, hash]);
    await sendLoginCode(email);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "No se pudo completar el registro. Intentá de nuevo." });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
// Valida gmail + contraseña y manda el código de 6 dígitos.
app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!isValidEmail(email)) return res.status(400).json({ error: "Email inválido" });

  try {
    const rows = await query("SELECT Password_Hash FROM Usuarios WHERE Gmail = ?", [email]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].Password_Hash))) {
      return res.status(401).json({ error: "Gmail o contraseña incorrectos" });
    }
    await sendLoginCode(email);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "No se pudo iniciar sesión. Intentá de nuevo." });
  }
});

// ── POST /api/auth/verify ──────────────────────────────────────────────────
// Confirma el código de 6 dígitos y recién ahí abre la sesión.
app.post("/api/auth/verify", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const code = String(req.body.code || "").trim();

  cleanupExpired(pendingTokens);
  const pending = pendingTokens.get(email);
  if (!pending || pending.code !== code) {
    return res.status(400).json({ error: "Código incorrecto o vencido" });
  }
  pendingTokens.delete(email);

  try {
    const rows = await query("SELECT Id_Usuario FROM Usuarios WHERE Gmail = ?", [email]);
    if (!rows.length) return res.status(400).json({ error: "No existe una cuenta con ese gmail" });

    const token = crypto.randomUUID();
    const isAdmin = email === ADMIN_EMAIL;
    const expiresAt = Date.now() + SESSION_TTL_MS;
    sessions.set(token, { userId: rows[0].Id_Usuario, email, isAdmin, expiresAt });

    res.json({ token, email, isAdmin, expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cierra todas las sesiones activas de un usuario (se usa al resetear la contraseña).
function revokeSessionsForUser(userId) {
  for (const [token, session] of sessions) {
    if (session.userId === userId) sessions.delete(token);
  }
}

// ── POST /api/auth/forgot-password ─────────────────────────────────────────
// Si el gmail tiene cuenta, manda un código de 6 dígitos para resetear la contraseña.
// Responde { ok: true } siempre, exista o no la cuenta, para no filtrar qué mails están registrados.
app.post("/api/auth/forgot-password", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) return res.status(400).json({ error: "Email inválido" });

  try {
    const rows = await query("SELECT Id_Usuario FROM Usuarios WHERE Gmail = ?", [email]);
    if (rows.length) {
      cleanupExpired(resetTokens);
      const code = generateCode();
      resetTokens.set(email, { code, expiresAt: Date.now() + TOKEN_TTL_MS });
      await mailTransport.sendMail({
        from: `"Panel Uno" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Restablecer tu contraseña — Panel Uno",
        text: `Tu código para restablecer la contraseña es: ${code}\n\nVence en 10 minutos. Si no lo pediste vos, ignorá este mail.`,
        html: `<p>Tu código para restablecer la contraseña en <b>Panel Uno</b> es:</p><h1 style="letter-spacing:0.2em">${code}</h1><p>Vence en 10 minutos. Si no lo pediste vos, ignorá este mail.</p>`,
      });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "No se pudo enviar el mail. Intentá de nuevo." });
  }
});

// ── POST /api/auth/reset-password ──────────────────────────────────────────
// Confirma el código de "olvidé mi contraseña" y guarda la nueva contraseña.
app.post("/api/auth/reset-password", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const code = String(req.body.code || "").trim();
  const newPassword = String(req.body.newPassword || "");

  if (newPassword.length < 6) return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

  cleanupExpired(resetTokens);
  const pending = resetTokens.get(email);
  if (!pending || pending.code !== code) {
    return res.status(400).json({ error: "Código incorrecto o vencido" });
  }
  resetTokens.delete(email);

  try {
    const rows = await query("SELECT Id_Usuario FROM Usuarios WHERE Gmail = ?", [email]);
    if (!rows.length) return res.status(400).json({ error: "No existe una cuenta con ese gmail" });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute("UPDATE Usuarios SET Password_Hash = ? WHERE Id_Usuario = ?", [hash, rows[0].Id_Usuario]);
    revokeSessionsForUser(rows[0].Id_Usuario);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/session ──────────────────────────────────────────────────
app.get("/api/auth/session", (req, res) => {
  const session = getSessionFromReq(req);
  if (!session) return res.status(401).json({ error: "Sesión inválida" });
  res.json({ email: session.email, isAdmin: session.isAdmin });
});

// ── GET /api/cart (requiere sesión) ────────────────────────────────────────
app.get("/api/cart", requireSession, async (req, res) => {
  try {
    const rows = await query(
      "SELECT Id_Comic AS comicId, Cantidad AS quantity FROM Carrito_Items WHERE Id_Usuario = ?",
      [req.session.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/cart/item (requiere sesión) ───────────────────────────────────
// Upsert de la cantidad de un cómic en el carrito del usuario logueado.
app.put("/api/cart/item", requireSession, async (req, res) => {
  const comicId = Number(req.body.comicId);
  const quantity = Number(req.body.quantity);
  if (!Number.isFinite(comicId) || !Number.isFinite(quantity)) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  try {
    if (quantity <= 0) {
      await pool.execute("DELETE FROM Carrito_Items WHERE Id_Usuario = ? AND Id_Comic = ?", [req.session.userId, comicId]);
    } else {
      await pool.execute(
        `INSERT INTO Carrito_Items (Id_Usuario, Id_Comic, Cantidad)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE Cantidad = VALUES(Cantidad)`,
        [req.session.userId, comicId, quantity]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/cart/item/:comicId (requiere sesión) ───────────────────────
app.delete("/api/cart/item/:comicId", requireSession, async (req, res) => {
  try {
    await pool.execute("DELETE FROM Carrito_Items WHERE Id_Usuario = ? AND Id_Comic = ?", [req.session.userId, req.params.comicId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/cart (requiere sesión) ─────────────────────────────────────
// Vacía el carrito guardado (se usa tras confirmar una compra).
app.delete("/api/cart", requireSession, async (req, res) => {
  try {
    await pool.execute("DELETE FROM Carrito_Items WHERE Id_Usuario = ?", [req.session.userId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Configuración de conexión ──────────────────────────────────────────────
// Cambiá estos valores por los de tu servidor MySQL local
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",           // tu contraseña de MySQL
  database: "Tienda_Comics",
  waitForConnections: true,
  connectionLimit: 10,
});

// ── Helper: ejecutar query ─────────────────────────────────────────────────
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// ── SELECT completo de comics con joins ───────────────────────────────────
const COMICS_SELECT = `
  SELECT
    c.Id_Comic      AS id,
    c.Nombre        AS title,
    c.Sinopsis      AS synopsis,
    YEAR(c.Anio_lanzamiento) AS year,
    c.Destacado     AS featured,
    c.Precio        AS price,
    c.Stock         AS stock,
    c.Cover         AS cover,
    e.Id_Editorial  AS publisherId,
    e.Nombre        AS publisher,
    f.Id_Franquicia AS franchiseId,
    f.Nombre        AS franchise,
    a.Id_Autor      AS authorId,
    a.Nombre        AS author,
    g.Id_Genero     AS genreId,
    g.Nombre        AS genre
  FROM Comics c
  JOIN Editoriales e ON c.Id_Editorial = e.Id_Editorial
  JOIN Franquicias f ON c.Id_Franquicia = f.Id_Franquicia
  JOIN Autores     a ON c.Id_Autor      = a.Id_Autor
  JOIN Generos     g ON c.Id_Genero     = g.Id_Genero
`;

// ── GET /api/comics ────────────────────────────────────────────────────────
app.get("/api/comics", async (req, res) => {
  try {
    const rows = await query(COMICS_SELECT + " ORDER BY c.Nombre");
    res.json(rows.map(mapComic));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/comics/:id ────────────────────────────────────────────────────
app.get("/api/comics/:id", async (req, res) => {
  try {
    const rows = await query(COMICS_SELECT + " WHERE c.Id_Comic = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "No encontrado" });
    res.json(mapComic(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/comics (requiere admin) ──────────────────────────────────────
app.post("/api/comics", requireAdmin, async (req, res) => {
  try {
    const { title, synopsis, year, featured, price, stock, cover, publisherId, franchiseId, authorId, genreId } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO Comics
        (Nombre, Sinopsis, Anio_lanzamiento, Destacado, Precio, Stock, Cover, Id_Editorial, Id_Franquicia, Id_Autor, Id_Genero)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, synopsis, `${year}-01-01`, featured ? 1 : 0, price, stock ?? 0, cover ?? "", publisherId, franchiseId, authorId, genreId]
    );
    const rows = await query(COMICS_SELECT + " WHERE c.Id_Comic = ?", [result.insertId]);
    res.status(201).json(mapComic(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/comics/:id (requiere admin) ───────────────────────────────────
app.put("/api/comics/:id", requireAdmin, async (req, res) => {
  try {
    const { title, synopsis, year, featured, price, stock, cover, publisherId, franchiseId, authorId, genreId } = req.body;
    await pool.execute(
      `UPDATE Comics SET
        Nombre = ?, Sinopsis = ?, Anio_lanzamiento = ?, Destacado = ?,
        Precio = ?, Stock = ?, Cover = ?,
        Id_Editorial = ?, Id_Franquicia = ?, Id_Autor = ?, Id_Genero = ?
       WHERE Id_Comic = ?`,
      [title, synopsis, `${year}-01-01`, featured ? 1 : 0, price, stock ?? 0, cover ?? "", publisherId, franchiseId, authorId, genreId, req.params.id]
    );
    const rows = await query(COMICS_SELECT + " WHERE c.Id_Comic = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "No encontrado" });
    res.json(mapComic(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/comics/:id (requiere admin) ────────────────────────────────
app.delete("/api/comics/:id", requireAdmin, async (req, res) => {
  try {
    await pool.execute("DELETE FROM Comics WHERE Id_Comic = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── decrementStock ─────────────────────────────────────────────────────────
// items: [{ id: number, quantity: number }, ...]
// Descuenta el stock de cada cómic en una transacción.
async function decrementStock(items) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const { id, quantity } of items) {
      // Verificar stock suficiente
      const [rows] = await conn.execute(
        "SELECT Stock FROM Comics WHERE Id_Comic = ? FOR UPDATE",
        [id]
      );
      if (!rows.length) throw new Error(`Comic ${id} no encontrado`);
      if (rows[0].Stock < quantity) throw new Error(`Stock insuficiente para comic ${id}`);
      await conn.execute(
        "UPDATE Comics SET Stock = Stock - ? WHERE Id_Comic = ?",
        [quantity, id]
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ── GET /api/mp-public-key ─────────────────────────────────────────────────
app.get("/api/mp-public-key", (req, res) => {
  res.json({ publicKey: process.env.MP_PUBLIC_KEY });
});

// ── POST /api/process-payment ──────────────────────────────────────────────
// Body: { formData: <datos del Payment Brick>, items: [{ id, quantity }, ...] }
app.post("/api/process-payment", async (req, res) => {
  const { formData, items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Carrito vacío" });
  }
  try {
    const payment = new Payment(mpClient);
    const result = await payment.create({
      body: formData,
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    });

    if (result.status === "approved") {
      await decrementStock(items);
    }

    res.json({ status: result.status, status_detail: result.status_detail, id: result.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── GET /api/generos ───────────────────────────────────────────────────────
app.get("/api/generos", async (req, res) => {
  try {
    const rows = await query("SELECT Id_Genero AS id, Nombre AS name FROM Generos ORDER BY Nombre");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/editoriales ──────────────────────────────────────────────────
app.get("/api/editoriales", async (req, res) => {
  try {
    const rows = await query("SELECT Id_Editorial AS id, Nombre AS name FROM Editoriales ORDER BY Nombre");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/franquicias ──────────────────────────────────────────────────
app.get("/api/franquicias", async (req, res) => {
  try {
    const rows = await query("SELECT Id_Franquicia AS id, Nombre AS name FROM Franquicias ORDER BY Nombre");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/autores ──────────────────────────────────────────────────────
app.get("/api/autores", async (req, res) => {
  try {
    const rows = await query("SELECT Id_Autor AS id, Nombre AS name FROM Autores ORDER BY Nombre");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Mapper fila DB → objeto Comic del frontend ────────────────────────────
function mapComic(row) {
  return {
    id:          row.id,
    title:       row.title,
    synopsis:    row.synopsis ?? "",
    year:        row.year,
    featured:    Boolean(row.featured),
    price:       Number(row.price),
    stock:       Number(row.stock ?? 0),
    cover:       row.cover ?? "",
    publisher:   row.publisher,
    publisherId: row.publisherId,
    franchise:   row.franchise,
    franchiseId: row.franchiseId,
    author:      row.author,
    authorId:    row.authorId,
    genre:       row.genre,
    genreId:     row.genreId,
  };
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API corriendo en http://localhost:${PORT}`));
