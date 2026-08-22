-- Portadas cargadas manualmente desde los resúmenes de Wikipedia (upload.wikimedia.org),
-- buscadas por título de cada cómic. Reemplaza a obtener_portadas.js, que dependía de la
-- API de Google Books (con cuota diaria limitada y sin garantía de encontrar el título
-- correcto). Ejecutá esto para reponer las portadas en una base de datos nueva.

UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/b/b1/Batman_vol._1-404_%28January_1987%29.jpg' WHERE Id_Comic = 1; -- Batman: Año Uno
UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/1/1e/Spider-Man-Blue.png' WHERE Id_Comic = 2; -- Spider-Man: Azul
UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/a/a2/Watchmen%2C_issue_1.jpg' WHERE Id_Comic = 3; -- Watchmen
UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/d/dd/Supermanredson.jpg' WHERE Id_Comic = 4; -- Superman: Red Son
UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/3/32/Killingjoke.JPG' WHERE Id_Comic = 5; -- The Killing Joke
UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/2/23/Civil_War_7.jpg' WHERE Id_Comic = 6; -- Civil War
UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/b/b2/Batman_The_Dark_Knight_Returns_1_%28February_1986%29.jpg' WHERE Id_Comic = 7; -- The Dark Knight Returns
UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/c/c0/V_for_vendettax.jpg' WHERE Id_Comic = 8; -- V for Vendetta
UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/5/5e/XMen135.jpg' WHERE Id_Comic = 9; -- X-Men: Dark Phoenix
UPDATE Comics SET Cover = 'https://upload.wikimedia.org/wikipedia/en/0/07/Invincible_Issue_75.jpeg' WHERE Id_Comic = 10; -- Invincible
