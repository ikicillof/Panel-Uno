export type Comic = {
  id: number;
  title: string;
  franchise: string;
  franchiseId?: number;
  publisher: string;
  publisherId?: number;
  author: string;
  authorId?: number;
  year: number;
  price: number;
  stock: number;
  genre: string;
  genreId?: number;
  synopsis: string;
  cover: string;
  featured: boolean;
};

export const INITIAL_COMICS: Comic[] = [
  {
    id: 1,
    title: "Batman: Año Uno",
    franchise: "Batman",
    publisher: "DC Comics",
    author: "Frank Miller",
    year: 1987,
    price: 18990,
    stock: 3,
    genre: "Superhéroes",
    synopsis: "El origen de Batman y Gordon.",
    cover: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop&auto=format",
    featured: true,
  },
  {
    id: 2,
    title: "Spider-Man: Azul",
    franchise: "Spider-Man",
    publisher: "Marvel Comics",
    author: "Jeph Loeb",
    year: 2002,
    price: 16500,
    stock: 5,
    genre: "Aventura",
    synopsis: "Peter recuerda a su primer amor.",
    cover: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop&auto=format",
    featured: true,
  },
  {
    id: 3,
    title: "Watchmen",
    franchise: "Watchmen",
    publisher: "DC Comics",
    author: "Alan Moore",
    year: 1986,
    price: 22990,
    stock: 2,
    genre: "Drama",
    synopsis: "Héroes retirados investigan un asesinato.",
    cover: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop&auto=format",
    featured: true,
  },
  {
    id: 4,
    title: "The Dark Knight Returns",
    franchise: "Batman",
    publisher: "DC Comics",
    author: "Frank Miller",
    year: 1986,
    price: 24990,
    stock: 4,
    genre: "Acción",
    synopsis: "Un Batman retirado vuelve a combatir.",
    cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&auto=format",
    featured: true,
  },
  {
    id: 5,
    title: "X-Men: Dark Phoenix",
    franchise: "X-Men",
    publisher: "Marvel Comics",
    author: "Chris Claremont",
    year: 1980,
    price: 18750,
    stock: 6,
    genre: "Ciencia ficción",
    synopsis: "Jean Grey pierde el control de su poder.",
    cover: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400&h=600&fit=crop&auto=format",
    featured: false,
  },
  {
    id: 6,
    title: "V for Vendetta",
    franchise: "V for Vendetta",
    publisher: "DC Comics",
    author: "Alan Moore",
    year: 1988,
    price: 20990,
    stock: 7,
    genre: "Thriller",
    synopsis: "Un revolucionario lucha contra un régimen.",
    cover: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop&auto=format",
    featured: false,
  },
  {
    id: 7,
    title: "Invincible",
    franchise: "Invincible",
    publisher: "Image Comics",
    author: "Robert Kirkman",
    year: 2003,
    price: 15990,
    stock: 10,
    genre: "Aventura",
    synopsis: "Un joven descubre sus poderes heredados.",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&auto=format",
    featured: false,
  },
];

export const GENRES = [
  "Todos",
  "Acción",
  "Aventura",
  "Superhéroes",
  "Ciencia ficción",
  "Fantasía",
  "Terror",
  "Comedia",
  "Drama",
  "Misterio",
  "Thriller",
];

export const PUBLISHERS = [
  "Todos",
  "DC Comics",
  "Marvel Comics",
  "Image Comics",
  "Dark Horse",
  "Panini Comics",
  "IDW Publishing",
];
