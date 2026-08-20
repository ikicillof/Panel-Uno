CREATE DATABASE Tienda_Comics;

CREATE TABLE Generos(
	Id_Genero int primary key auto_increment,
	Nombre varchar(30)
);

CREATE TABLE Franquicias(
	Id_Franquicia int primary key auto_increment,
    Nombre varchar(30),
    Anio_fundacion year
);

CREATE TABLE Clientes(
	Id_Cliente int primary key auto_increment,
    Nombre varchar(30),
    Fecha_nacimiento date,
    Correo varchar(30)
);

CREATE TABLE Paises(
	Id_Pais int primary key auto_increment,
    Nombre Varchar(30),
    Anio_fundacion year
);

CREATE TABLE Puestos(
	Id_Puesto int primary key auto_increment,
    Nombre varchar(30),
    Descripcion varchar(50)
);

CREATE TABLE Ciudades(
	Id_Ciudad int primary key auto_increment,
    Nombre varchar(30),
    Anio_fundacion year,
    foreign key(Id_Pais) references Paises(Id_Pais)
);

CREATE TABLE Sucursales(
	Id_Sucursal int primary key auto_increment,
    Nombre varchar(30),
    Id_Ciudad int,
    foreign key(Id_Ciudad) references Ciudades(Id_Ciudad)
);

CREATE TABLE Empleados(
	Id_Empleado int primary key auto_increment,
    Nombre varchar(30),
    Telefono int(12),
    Sueldo decimal(10,2),
    Fecha_nacimiento year,
    Id_Puesto int,
    Id_Sucursal int,
    
    foreign key(Id_Puesto) references Puestos(Id_Puesto),
    foreign key(Id_Sucursal) references Sucursales(Id_Sucursal)
);

CREATE TABLE Proveedores(
	Id_Proveedor int primary key auto_increment,
    Nombre varchar(30),
    Telefono int(12),
    Correo varchar(30),
    Id_Pais int,
    
    foreign key (Id_Pais) references Paises (Id_Pais)
);

CREATE TABLE Editoriales(
	Id_Editorial int primary key auto_increment,
    Nombre varchar(30),
    Correo varchar(30),
    Id_Pais int,
    
    foreign key (Id_Pais) references Paises(Id_Pais)
);

CREATE TABLE Autores(
	Id_Autor int primary key auto_increment,
    Nombre varchar(30),
    Fecha_nacimiento date,
    Id_Pais int,
    
    foreign key (Id_Pais) references Paises(Id_Pais)
);

CREATE TABLE Ventas(
	Id_Venta int primary key auto_increment,
    Fecha date,
    Monto_total decimal(10,2),
    Id_Cliente int,
    Id_Empleado int,
    
    foreign key(Id_Cliente) references Clientes(Id_Cliente),
    foreign key(Id_Empleado) references Empleados(Id_Empleado)
);

CREATE TABLE Comics(
	Id_Comic int primary key auto_increment,
    Nombre varchar(30),
    Sinopsis varchar(50),
    Anio_lanzamiento date,
    Destacado boolean,
    Precio decimal(10,2),
    Id_Editorial int,
    Id_Franquicia int,
    Id_Autor int,
    Id_Genero int,
    
    foreign key(Id_Editorial) references Editoriales(Id_Editorial),
    foreign key(Id_Franquicia) references Franquicias(Id_Franquicia),
    foreign key(Id_Autor) references Autores(Id_Autor),
    foreign key(Id_Genero) references Generos(Id_Genero)
);

CREATE TABLE Carritos(
	Id_Carrito int primary key auto_increment,
    Cantidad int(3),
    Id_Comic int,
    Id_Venta int,
    
    foreign key(Id_Comic) references Comics(Id_Comic),
    foreign key(Id_Venta) references Ventas(Id_Venta)
);

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

INSERT INTO Franquicia (Nombre, Anio_fundacion) VALUES
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
