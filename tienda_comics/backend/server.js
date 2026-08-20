const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

// ── POST /api/comics ───────────────────────────────────────────────────────
app.post("/api/comics", async (req, res) => {
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

// ── PUT /api/comics/:id ────────────────────────────────────────────────────
app.put("/api/comics/:id", async (req, res) => {
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

// ── DELETE /api/comics/:id ─────────────────────────────────────────────────
app.delete("/api/comics/:id", async (req, res) => {
  try {
    await pool.execute("DELETE FROM Comics WHERE Id_Comic = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/checkout ────────────────────────────────────────────────────
// Body: [{ id: number, quantity: number }, ...]
// Descuenta el stock de cada cómic en una transacción.
app.post("/api/checkout", async (req, res) => {
  const items = req.body; // [{ id, quantity }]
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Carrito vacío" });
  }
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
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
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
