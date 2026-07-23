// Historial de "vistos recientemente" guardado en el navegador (localStorage),
// sin backend: cada visita a un producto se agrega al frente, deduplicada por
// id, tope de 12 productos.

export interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  business_id: string;
  business_name: string;
  business_category: string;
}

const STORAGE_KEY = "recently_viewed_products";
const MAX_ITEMS = 12;

export function trackRecentlyViewed(item: RecentlyViewedItem): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentlyViewed();
    const withoutCurrent = current.filter((p) => p.id !== item.id);
    const updated = [item, ...withoutCurrent].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage no disponible (modo privado, etc.); no es critico, se ignora.
  }
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
  } catch {
    return [];
  }
}
