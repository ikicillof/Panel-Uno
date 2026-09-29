-- Base de datos de Panel Uno (Tienda_Comics) para Netlify Database (Postgres).
-- Es la conversión a Postgres de Tienda_Comics.sql + backend/migrations.sql + backend/portadas.sql.
-- Netlify la aplica sola en el primer deploy; no hace falta correrla a mano.

CREATE TABLE Generos(
    Id_Genero serial primary key,
    Nombre varchar(30)
);

CREATE TABLE Franquicias(
    Id_Franquicia serial primary key,
    Nombre varchar(30),
    Anio_fundacion smallint
);

CREATE TABLE Clientes(
    Id_Cliente serial primary key,
    Nombre varchar(30),
    Fecha_nacimiento date,
    Correo varchar(30)
);

CREATE TABLE Paises(
    Id_Pais serial primary key,
    Nombre varchar(30),
    Anio_fundacion smallint
);

CREATE TABLE Puestos(
    Id_Puesto serial primary key,
    Nombre varchar(30),
    Descripcion varchar(50)
);

CREATE TABLE Ciudades(
    Id_Ciudad serial primary key,
    Nombre varchar(30),
    Anio_fundacion smallint,
    Id_Pais int references Paises(Id_Pais)
);

CREATE TABLE Sucursales(
    Id_Sucursal serial primary key,
    Nombre varchar(30),
    Id_Ciudad int references Ciudades(Id_Ciudad)
);

CREATE TABLE Empleados(
    Id_Empleado serial primary key,
    Nombre varchar(30),
    Telefono bigint,
    Sueldo decimal(10,2),
    Fecha_nacimiento date,
    Id_Puesto int references Puestos(Id_Puesto),
    Id_Sucursal int references Sucursales(Id_Sucursal)
);

CREATE TABLE Proveedores(
    Id_Proveedor serial primary key,
    Nombre varchar(30),
    Telefono bigint,
    Correo varchar(30),
    Id_Pais int references Paises(Id_Pais)
);

CREATE TABLE Editoriales(
    Id_Editorial serial primary key,
    Nombre varchar(30),
    Correo varchar(30),
    Id_Pais int references Paises(Id_Pais)
);

CREATE TABLE Autores(
    Id_Autor serial primary key,
    Nombre varchar(30),
    Fecha_nacimiento date,
    Id_Pais int references Paises(Id_Pais)
);

CREATE TABLE Ventas(
    Id_Venta serial primary key,
    Fecha date,
    Monto_total decimal(10,2),
    Id_Cliente int references Clientes(Id_Cliente),
    Id_Empleado int references Empleados(Id_Empleado)
);

CREATE TABLE Comics(
    Id_Comic serial primary key,
    Nombre varchar(30),
    Sinopsis varchar(50),
    Anio_lanzamiento date,
    Destacado boolean,
    Precio decimal(10,2),
    Stock int NOT NULL DEFAULT 0,
    Cover varchar(300) DEFAULT '',
    Id_Editorial int references Editoriales(Id_Editorial),
    Id_Franquicia int references Franquicias(Id_Franquicia),
    Id_Autor int references Autores(Id_Autor),
    Id_Genero int references Generos(Id_Genero)
);

CREATE TABLE Carritos(
    Id_Carrito serial primary key,
    Cantidad int,
    Id_Comic int references Comics(Id_Comic),
    Id_Venta int references Ventas(Id_Venta)
);

-- Login por gmail + contraseña, y carrito persistente por usuario.
CREATE TABLE Usuarios (
    Id_Usuario serial primary key,
    Gmail varchar(255) NOT NULL UNIQUE,
    Password_Hash varchar(255) NOT NULL,
    Creado_En timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Carrito_Items (
    Id_Usuario int NOT NULL references Usuarios(Id_Usuario) ON DELETE CASCADE,
    Id_Comic int NOT NULL references Comics(Id_Comic) ON DELETE CASCADE,
    Cantidad int NOT NULL DEFAULT 1,
    PRIMARY KEY (Id_Usuario, Id_Comic)
);

-- En Netlify el backend corre como función serverless (sin memoria entre pedidos),
-- así que las sesiones y los códigos de 6 dígitos se guardan acá en vez de en un Map.
CREATE TABLE Sesiones (
    Token varchar(64) primary key,
    Id_Usuario int NOT NULL references Usuarios(Id_Usuario) ON DELETE CASCADE,
    Es_Admin boolean NOT NULL DEFAULT false,
    Vence_En bigint NOT NULL
);

CREATE TABLE Codigos (
    Gmail varchar(255) NOT NULL,
    Tipo varchar(10) NOT NULL, -- 'login' o 'reset'
    Codigo varchar(6) NOT NULL,
    Vence_En bigint NOT NULL,
    PRIMARY KEY (Gmail, Tipo)
);

INSERT INTO Generos (Nombre) VALUES
('Acción'),
('Aventura'),
('Superhéroes'),
('Ciencia ficción'),
('Fantasía'),
('Terror'),
('Comedia'),
('Drama'),
('Misterio'),
('Thriller');



INSERT INTO Franquicias (Nombre, Anio_fundacion) VALUES
('Batman', 1939),
('Spider-Man', 1962),
('Watchmen', 1986),
('Superman', 1938),
('X-Men', 1963),
('Invincible', 2003),
('V for Vendetta', 1982),
('The Avengers', 1963),
('Justice League', 1960),
('Deadpool', 1991);

INSERT INTO Clientes (Nombre, Fecha_nacimiento, Correo) VALUES
('Juan Perez', '1998-05-12', 'juan@gmail.com'),
('Maria Lopez', '2000-08-21', 'maria@gmail.com'),
('Carlos Gomez', '1995-03-17', 'carlos@gmail.com'),
('Lucia Martinez', '2001-11-05', 'lucia@gmail.com'),
('Pedro Sanchez', '1997-07-30', 'pedro@gmail.com'),
('Ana Rodriguez', '1999-02-14', 'ana@gmail.com'),
('Diego Fernandez', '1996-09-25', 'diego@gmail.com'),
('Sofia Torres', '2002-06-18', 'sofia@gmail.com'),
('Martin Diaz', '1994-12-03', 'martin@gmail.com'),
('Valentina Ruiz', '2000-10-27', 'valentina@gmail.com');

INSERT INTO Paises (Nombre, Anio_fundacion) VALUES
('Argentina', 1816),
('Estados Unidos', 1776),
('Reino Unido', 1707),
('Canada', 1867),
('Japon', 660),
('Francia', 843),
('Italia', 1861),
('España', 1479),
('Alemania', 1871),
('Brasil', 1822);

INSERT INTO Editoriales
(Nombre, Correo, Id_Pais)
VALUES
('DC Comics', 'contacto@dc.com', 2),
('Marvel Comics', 'contacto@marvel.com', 2),
('Image Comics', 'contacto@image.com', 2),
('Dark Horse', 'contacto@darkhorse.com', 2),
('Panini Comics', 'contacto@panini.com', 7),
('ECC Ediciones', 'contacto@ecc.com', 8),
('Kodansha', 'contacto@kodansha.com', 5),
('Titan Comics', 'contacto@titancomics.com', 3),
('Norma Editorial', 'contacto@norma.com', 8),
('IDW Publishing', 'contacto@idw.com', 2);

INSERT INTO Puestos (Nombre, Descripcion) VALUES
('Gerente', 'Administra la sucursal'),
('Vendedor', 'Atiende a los clientes'),
('Cajero', 'Gestiona los pagos'),
('Deposito', 'Organiza el inventario'),
('Supervisor', 'Supervisa empleados'),
('Administrador', 'Gestiona el negocio'),
('Repositor', 'Repone productos'),
('Encargado', 'Controla la sucursal'),
('Contador', 'Gestiona las finanzas'),
('Atencion', 'Atiende consultas');

INSERT INTO Ciudades (Nombre, Anio_fundacion, Id_Pais) VALUES
('Buenos Aires', 1536, 1),
('Nueva York', 1624, 2),
('Londres', 43, 3),
('Toronto', 1793, 4),
('Tokio', 1603, 5),
('Paris', 52, 6),
('Roma', -753, 7),
('Madrid', 860, 8),
('Berlin', 1237, 9),
('Brasilia', 1960, 10);

INSERT INTO Sucursales (Nombre, Id_Ciudad) VALUES
('Comic Store Centro', 1),
('Comic Store Palermo', 1),
('Comic Store Manhattan', 2),
('Comic Store London', 3),
('Comic Store Toronto', 4),
('Comic Store Tokyo', 5),
('Comic Store Paris', 6),
('Comic Store Roma', 7),
('Comic Store Madrid', 8),
('Comic Store Berlin', 9);

INSERT INTO Empleados
(Nombre, Telefono, Sueldo, Fecha_nacimiento, Id_Puesto, Id_Sucursal)
VALUES
('Marcos Silva', 1123456789, 850000.00, '1985-04-12', 1, 1),
('Laura Perez', 1134567890, 650000.00, '1992-07-20', 2, 1),
('Nicolas Gomez', 1145678901, 580000.00, '1995-01-15', 3, 2),
('Camila Torres', 1156789012, 620000.00, '1993-09-10', 2, 2),
('Federico Ruiz', 1167890123, 600000.00, '1990-11-25', 4, 3),
('Julieta Diaz', 1178901234, 700000.00, '1988-06-18', 5, 4),
('Lucas Fernandez', 1189012345, 550000.00, '1996-03-08', 7, 5),
('Carolina Lopez', 1190123456, 680000.00, '1991-12-02', 8, 6),
('Matias Romero', 1101234567, 750000.00, '1987-08-29', 6, 7),
('Florencia Castro', 1112345678, 590000.00, '1997-05-16', 10, 8);

INSERT INTO Proveedores(Nombre, Telefono, Correo, Id_Pais) VALUES
    ('Marvel Distribution', 1212345678, 'marvel@proveedor.com', 2),
    ('DC Distribution', 1223456789, 'dc@proveedor.com', 2),
    ('Panini Comics', 1234567890, 'panini@proveedor.com', 7),
    ('ECC Ediciones', 1245678901, 'ecc@proveedor.com', 8),
    ('Image Comics Supply', 1256789012, 'image@proveedor.com', 2),
    ('Dark Horse Supply', 1267890123, 'darkhorse@proveedor.com', 2),
    ('Kodansha Supply', 1278901234, 'kodansha@proveedor.com', 5),
    ('Titan Comics', 1289012345, 'titan@proveedor.com', 3),
    ('Norma Editorial', 1290123456, 'norma@proveedor.com', 8),
    ('Milky Way Ediciones', 1201234567, 'milkyway@proveedor.com', 8);

INSERT INTO Autores (Nombre, Fecha_nacimiento, Id_Pais) VALUES
('Frank Miller', '1957-01-27', 2),
('Jeph Loeb', '1958-09-16', 2),
('Alan Moore', '1953-11-18', 3),
('Mark Millar', '1969-12-24', 3),
('Chris Claremont', '1950-11-25', 2),
('Robert Kirkman', '1978-11-30', 2);



INSERT INTO Comics(Nombre, Sinopsis, Anio_lanzamiento, Destacado, Precio, Id_Editorial, Id_Franquicia, Id_Autor, Id_Genero) VALUES
    ('Batman: Año Uno',
     'El origen de Batman y Gordon.',
     '1987-01-01',
     TRUE,
     18.99,
     1, 1, 1, 1),

    ('Spider-Man: Azul',
     'Peter recuerda a su primer amor.',
     '2002-02-14',
     TRUE,
     16.50,
     2, 2, 2, 2),

    ('Watchmen',
     'Héroes retirados investigan un asesinato.',
     '1986-09-01',
     TRUE,
     22.99,
     3, 3, 3, 3),

    ('Superman: Red Son',
     'Superman crece en la Unión Soviética.',
     '2003-01-01',
     TRUE,
     19.99,
     1, 4, 4, 4),

    ('The Killing Joke',
     'Batman enfrenta nuevamente al Joker.',
     '1988-03-01',
     TRUE,
     17.99,
     1, 1, 1, 1),

    ('Civil War',
     'Los héroes se dividen por una nueva ley.',
     '2006-05-01',
     TRUE,
     21.50,
     2, 2, 2, 5),

    ('The Dark Knight Returns',
     'Un Batman retirado vuelve a combatir.',
     '1986-02-01',
     TRUE,
     24.99,
     1, 1, 1, 1),

    ('V for Vendetta',
     'Un revolucionario lucha contra un régimen.',
     '1988-03-01',
     FALSE,
     20.99,
     3, 3, 3, 3),

    ('X-Men: Dark Phoenix',
     'Jean Grey pierde el control de su poder.',
     '1980-01-01',
     TRUE,
     18.75,
     2, 5, 5, 5),

    ('Invincible',
     'Un joven descubre sus poderes heredados.',
     '2003-01-01',
     FALSE,
     15.99,
     4, 6, 6, 2);

-- Portadas (backend/portadas.sql)
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
