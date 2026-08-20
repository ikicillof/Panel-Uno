-- Ejecutá esto UNA vez en tu MySQL para agregar los campos que faltan en Comics

ALTER TABLE Comics
  ADD COLUMN Stock int NOT NULL DEFAULT 0,
  ADD COLUMN Cover varchar(300) DEFAULT '';
