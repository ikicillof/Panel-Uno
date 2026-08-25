-- Ejecutá esto UNA vez en tu MySQL para agregar los campos que faltan en Comics

ALTER TABLE Comics
  ADD COLUMN Stock int NOT NULL DEFAULT 0,
  ADD COLUMN Cover varchar(300) DEFAULT '';

-- Login por gmail + contraseña, y carrito persistente por usuario.

CREATE TABLE IF NOT EXISTS Usuarios (
  Id_Usuario INT AUTO_INCREMENT PRIMARY KEY,
  Gmail VARCHAR(255) NOT NULL UNIQUE,
  Password_Hash VARCHAR(255) NOT NULL,
  Creado_En DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Carrito_Items (
  Id_Usuario INT NOT NULL,
  Id_Comic INT NOT NULL,
  Cantidad INT NOT NULL DEFAULT 1,
  PRIMARY KEY (Id_Usuario, Id_Comic),
  FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id_Usuario) ON DELETE CASCADE,
  FOREIGN KEY (Id_Comic) REFERENCES Comics(Id_Comic) ON DELETE CASCADE
);
