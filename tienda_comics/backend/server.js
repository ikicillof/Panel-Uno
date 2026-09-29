// Servidor local: `node server.js` levanta la misma API que en Netlify corre como función.
const app = require("./app");

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API corriendo en http://localhost:${PORT}`));
