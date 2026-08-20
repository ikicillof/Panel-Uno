import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { INITIAL_COMICS, type Comic } from "../data/comics";
import { api, type ComicPayload, type SelectOption } from "../services/api";

type CartItem = { comic: Comic; quantity: number };

type StoreContextType = {
  comics: Comic[];
  loading: boolean;
  apiOnline: boolean;
  cart: CartItem[];
  addToCart: (comic: Comic) => void;
  removeFromCart: (id: number) => void;
  cartTotal: number;
  cartCount: number;
  checkout: () => Promise<void>;
  addComic: (payload: ComicPayload) => Promise<void>;
  updateComic: (id: number, payload: ComicPayload) => Promise<void>;
  deleteComic: (id: number) => Promise<void>;
  // select options para el formulario
  generos: SelectOption[];
  editoriales: SelectOption[];
  franquicias: SelectOption[];
  autores: SelectOption[];
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [generos, setGeneros] = useState<SelectOption[]>([]);
  const [editoriales, setEditoriales] = useState<SelectOption[]>([]);
  const [franquicias, setFranquicias] = useState<SelectOption[]>([]);
  const [autores, setAutores] = useState<SelectOption[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [comicsData, gen, ed, fr, au] = await Promise.all([
          api.getComics(),
          api.getGeneros(),
          api.getEditoriales(),
          api.getFranquicias(),
          api.getAutores(),
        ]);
        setComics(comicsData);
        setGeneros(gen);
        setEditoriales(ed);
        setFranquicias(fr);
        setAutores(au);
        setApiOnline(true);
      } catch {
        // API no disponible → usar datos mock locales
        setComics(INITIAL_COMICS);
        setApiOnline(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const addToCart = (comic: Comic) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.comic.id === comic.id);
      if (existing) {
        return prev.map((i) =>
          i.comic.id === comic.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { comic, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.comic.id !== id));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.comic.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const addComic = async (payload: ComicPayload) => {
    if (apiOnline) {
      const newComic = await api.createComic(payload);
      setComics((prev) => [...prev, newComic]);
    } else {
      // fallback local
      const id = Math.max(0, ...comics.map((c) => c.id)) + 1;
      const option = (list: SelectOption[], pid: number) =>
        list.find((o) => o.id === pid)?.name ?? "";
      setComics((prev) => [
        ...prev,
        {
          id,
          title: payload.title,
          synopsis: payload.synopsis,
          year: payload.year,
          featured: payload.featured,
          price: payload.price,
          stock: payload.stock,
          cover: payload.cover,
          publisher: option(editoriales, payload.publisherId),
          publisherId: payload.publisherId,
          franchise: option(franquicias, payload.franchiseId),
          franchiseId: payload.franchiseId,
          author: option(autores, payload.authorId),
          authorId: payload.authorId,
          genre: option(generos, payload.genreId),
          genreId: payload.genreId,
        },
      ]);
    }
  };

  const updateComic = async (id: number, payload: ComicPayload) => {
    if (apiOnline) {
      const updated = await api.updateComic(id, payload);
      setComics((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } else {
      const option = (list: SelectOption[], pid: number) =>
        list.find((o) => o.id === pid)?.name ?? "";
      setComics((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                title: payload.title,
                synopsis: payload.synopsis,
                year: payload.year,
                featured: payload.featured,
                price: payload.price,
                stock: payload.stock,
                cover: payload.cover,
                publisher: option(editoriales, payload.publisherId),
                publisherId: payload.publisherId,
                franchise: option(franquicias, payload.franchiseId),
                franchiseId: payload.franchiseId,
                author: option(autores, payload.authorId),
                authorId: payload.authorId,
                genre: option(generos, payload.genreId),
                genreId: payload.genreId,
              }
            : c
        )
      );
    }
  };

  const checkout = async () => {
    const items = cart.map((i) => ({ id: i.comic.id, quantity: i.quantity }));
    if (apiOnline) {
      await api.checkout(items);
    }
    // Descontar stock localmente siempre (refleja el estado real)
    setComics((prev) =>
      prev.map((c) => {
        const item = cart.find((i) => i.comic.id === c.id);
        if (!item) return c;
        return { ...c, stock: Math.max(0, c.stock - item.quantity) };
      })
    );
    setCart([]);
  };

  const deleteComic = async (id: number) => {
    if (apiOnline) await api.deleteComic(id);
    setComics((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        comics, loading, apiOnline,
        cart, addToCart, removeFromCart, cartTotal, cartCount, checkout,
        addComic, updateComic, deleteComic,
        generos, editoriales, franquicias, autores,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
