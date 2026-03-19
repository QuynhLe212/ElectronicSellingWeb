const FAVORITES_KEY = "favorites_products";

const readFavorites = () => {
  const raw = localStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeFavorites = (ids) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
};

export const getFavorites = () => {
  return readFavorites();
};

export const isFavorite = (productId) => {
  const favorites = readFavorites();
  return favorites.includes(String(productId));
};

export const addToFavorites = (productId) => {
  const favorites = readFavorites();
  const id = String(productId);
  if (!favorites.includes(id)) {
    favorites.push(id);
    writeFavorites(favorites);
  }
  return favorites;
};

export const removeFromFavorites = (productId) => {
  const favorites = readFavorites();
  const id = String(productId);
  const updated = favorites.filter((f) => f !== id);
  writeFavorites(updated);
  return updated;
};

export const toggleFavorite = (productId) => {
  if (isFavorite(productId)) {
    return removeFromFavorites(productId);
  } else {
    return addToFavorites(productId);
  }
};

export const clearAllFavorites = () => {
  writeFavorites([]);
};
