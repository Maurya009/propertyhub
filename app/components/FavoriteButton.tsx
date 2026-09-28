/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

type FavoriteButtonProps = {
  propertyId: string;
};

const STORAGE_KEY = "propertyhub_favorites";

export default function FavoriteButton({
  propertyId,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const favorites: string[] = JSON.parse(saved);

      setIsFavorite(favorites.includes(propertyId));
    } catch {
      setIsFavorite(false);
    }
  }, [propertyId]);

  const toggleFavorite = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      const favorites: string[] = saved
        ? JSON.parse(saved)
        : [];

      let updatedFavorites: string[];

      if (favorites.includes(propertyId)) {
        updatedFavorites = favorites.filter(
          (id) => id !== propertyId
        );
        setIsFavorite(false);
      } else {
        updatedFavorites = [...favorites, propertyId];
        setIsFavorite(true);
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedFavorites)
      );
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-label={
        isFavorite
          ? "Remove property from favourites"
          : "Add property to favourites"
      }
      aria-pressed={isFavorite}
      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow transition hover:scale-105"
    >
      {isFavorite ? "♥" : "♡"}
    </button>
  );
}