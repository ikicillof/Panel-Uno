// obtener_portadas.js
// Busca la portada de cada comic en la API pública de Google Books
// y genera los UPDATE para cargar la columna Cover en tu base de datos.
//
// Uso:
//   node obtener_portadas.js
//
// No necesita instalar nada extra (usa fetch, incluido desde Node 18+).
// Si tu Node es más viejo, corré: npm install node-fetch
// y descomentá la línea de abajo.

// const fetch = require('node-fetch');

const comics = [
  { id: 1, nombre: "Batman Year One" },
  { id: 2, nombre: "Spider-Man Blue Jeph Loeb" },
  { id: 3, nombre: "Watchmen Alan Moore" },
  { id: 4, nombre: "Superman Red Son" },
  { id: 5, nombre: "Batman The Killing Joke" },
  { id: 6, nombre: "Civil War Mark Millar" },
  { id: 7, nombre: "Batman The Dark Knight Returns" },
  { id: 8, nombre: "V for Vendetta Alan Moore" },
  { id: 9, nombre: "X-Men Dark Phoenix" },
  { id: 10, nombre: "Invincible Robert Kirkman" },
];

async function buscarPortada(titulo) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(titulo)}&maxResults=1`;
  const res = await fetch(url);
  const data = await res.json();

  const item = data.items?.[0];
  const thumb = item?.volumeInfo?.imageLinks?.thumbnail;
  // Google devuelve http y a veces zoom bajo; lo normalizamos a https
  // y le pedimos un poco más de resolución (zoom=1 en vez de zoom=5).
  if (!thumb) return null;
  return thumb.replace("http://", "https://").replace("zoom=5", "zoom=1");
}

async function main() {
  console.log("-- Portadas generadas automáticamente con Google Books API\n");
  for (const comic of comics) {
    try {
      const cover = await buscarPortada(comic.nombre);
      if (cover) {
        console.log(`UPDATE Comics SET Cover = '${cover}' WHERE Id_Comic = ${comic.id}; -- ${comic.nombre}`);
      } else {
        console.log(`-- No se encontró portada para: ${comic.nombre} (Id_Comic ${comic.id})`);
      }
    } catch (err) {
      console.log(`-- Error buscando "${comic.nombre}": ${err.message}`);
    }
    // pequeña pausa para no saturar la API
    await new Promise((r) => setTimeout(r, 300));
  }
}

main();
