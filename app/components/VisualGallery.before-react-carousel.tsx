"use client";

import { useEffect, useRef, useState } from "react";
import { getBrowserApiUrl } from "../lib/api";

type GalleryItem = {
  image: string;
  title: string;
  category: string;
  order: number;
  featured: boolean;
};

type GalleryApiItem = {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  order: number;
  featured: boolean;
};

const fallbackGalleryItems: GalleryItem[] = [
  { image: "/story-house/01.webp", title: "3 BHK Floor Plan", category: "Residences", order: 1, featured: false },
  { image: "/story-house/02.webp", title: "2 & 3 BHK Plans", category: "Residences", order: 2, featured: false },
  { image: "/story-house/03.webp", title: "Private Balcony Living", category: "Lifestyle", order: 3, featured: true },

  { image: "/story-house/04.webp", title: "Kids' Play Park", category: "Amenities", order: 4, featured: false },
  { image: "/story-house/05.webp", title: "Play & Explore", category: "Amenities", order: 5, featured: true },
  { image: "/story-house/06.webp", title: "Outdoor Play Space", category: "Amenities", order: 6, featured: false },
  { image: "/story-house/07.webp", title: "Family Recreation", category: "Amenities", order: 7, featured: false },

  { image: "/story-house/08.webp", title: "Fitness Centre", category: "Amenities", order: 8, featured: false },
  { image: "/story-house/09.webp", title: "Training Zone", category: "Amenities", order: 9, featured: false },
  { image: "/story-house/10.webp", title: "Wellness & Fitness", category: "Amenities", order: 10, featured: false },

  { image: "/story-house/11.webp", title: "Residents' Lounge", category: "Lifestyle", order: 11, featured: false },
  { image: "/story-house/12.webp", title: "Community Lounge", category: "Lifestyle", order: 12, featured: false },
  { image: "/story-house/13.webp", title: "Social Spaces", category: "Lifestyle", order: 13, featured: false },

  { image: "/story-house/14.webp", title: "Retail Promenade", category: "Retail", order: 14, featured: false },

  { image: "/story-house/15.webp", title: "Main Arrival", category: "Architecture", order: 15, featured: true },
  { image: "/story-house/16.webp", title: "Grand Entrance", category: "Architecture", order: 16, featured: false },
  { image: "/story-house/17.webp", title: "Arrival Court", category: "Architecture", order: 17, featured: false },
  { image: "/story-house/18.webp", title: "The Story House Entrance", category: "Architecture", order: 18, featured: false },

  { image: "/story-house/19.webp", title: "Indoor Swimming Pool", category: "Amenities", order: 19, featured: true },
  { image: "/story-house/20.webp", title: "Pool & Wellness", category: "Amenities", order: 20, featured: false },
  { image: "/story-house/21.webp", title: "Pool Lounge", category: "Amenities", order: 21, featured: false },

  { image: "/story-house/22.webp", title: "Retail Street", category: "Retail", order: 22, featured: false },
  { image: "/story-house/23.webp", title: "Retail Promenade", category: "Retail", order: 23, featured: false },
  { image: "/story-house/24.webp", title: "NMT & Retail Zone", category: "Retail", order: 24, featured: false },

  { image: "/story-house/25.webp", title: "Landscaped Drive", category: "Landscape", order: 25, featured: false },
  { image: "/story-house/26.webp", title: "Accessible Pathways", category: "Landscape", order: 26, featured: false },

  { image: "/story-house/27.webp", title: "Garden Retail Court", category: "Retail", order: 27, featured: false },
  { image: "/story-house/28.webp", title: "Outdoor Retail Zone", category: "Retail", order: 28, featured: false },
  { image: "/story-house/29.webp", title: "Promenade View", category: "Retail", order: 29, featured: false },

  { image: "/story-house/30.webp", title: "An Elevated Lifestyle", category: "Lifestyle", order: 30, featured: false },
  { image: "/story-house/31.webp", title: "Mini Theatre", category: "Amenities", order: 31, featured: false },
  { image: "/story-house/32.webp", title: "Social Lounge", category: "Lifestyle", order: 32, featured: true },
  { image: "/story-house/33.webp", title: "Walk & Connect", category: "Lifestyle", order: 33, featured: false },
  { image: "/story-house/34.webp", title: "Residential Architecture", category: "Architecture", order: 34, featured: true },
  { image: "/story-house/35.webp", title: "Indoor Games", category: "Amenities", order: 35, featured: false },
];

const categories = [
  "All",
  "Architecture",
  "Residences",
  "Amenities",
  "Lifestyle",
  "Retail",
  "Landscape",
];

const originalFeaturedOrder = [
  "/story-house/34.webp",
  "/story-house/15.webp",
  "/story-house/03.webp",
  "/story-house/19.webp",
  "/story-house/05.webp",
  "/story-house/32.webp",
];

export default function VisualGallery() {
  const [galleryItems, setGalleryItems] =
    useState<GalleryItem[]>(fallbackGalleryItems);

  const [activeCategory, setActiveCategory] =
    useState("All");

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const [showAll, setShowAll] =
    useState(false);

  const featuredViewportRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadGallery() {
      try {
        const response = await fetch(
          `${getBrowserApiUrl()}/gallery`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (
          !response.ok ||
          !data.success ||
          !Array.isArray(data.data) ||
          data.data.length === 0
        ) {
          return;
        }

        const remoteItems: GalleryItem[] =
          (data.data as GalleryApiItem[])
            .filter(
              (item) =>
                item.imageUrl &&
                item.title &&
                item.category
            )
            .map((item) => ({
              image: item.imageUrl,
              title: item.title,
              category: item.category,
              order: Number(item.order) || 0,
              featured: Boolean(item.featured),
            }))
            .sort((a, b) => a.order - b.order);

        if (mounted && remoteItems.length > 0) {
          setGalleryItems(remoteItems);
        }
      } catch (error) {
        console.error(
          "Gallery API unavailable. Using local gallery fallback.",
          error
        );
      }
    }

    void loadGallery();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter(
          (item) =>
            item.category === activeCategory
        );

  // Visual Story uses the complete gallery collection.
  // When a category is selected, that category's full set is shown.
  const visualStoryItems = galleryItems.filter((item) => {
    const title = item.title.toLowerCase();

    return (
      item.category !== "Residences" &&
      !title.includes("floor plan") &&
      !title.includes("bhk plan") &&
      !title.includes("plans")
    );
  });

  const featuredItems =
    activeCategory === "All"
      ? [...visualStoryItems].sort((a, b) => a.order - b.order)
      : [...visualStoryItems]
          .filter(
            (item) =>
              item.category === activeCategory
          )
          .sort((a, b) => a.order - b.order);

  const selectedItem =
    selectedIndex !== null
      ? galleryItems[selectedIndex]
      : null;

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (selectedIndex === null) return;

      if (event.key === "Escape") {
        setSelectedIndex(null);
      }

      if (event.key === "ArrowRight") {
        setSelectedIndex(
          (selectedIndex + 1) %
            galleryItems.length
        );
      }

      if (event.key === "ArrowLeft") {
        setSelectedIndex(
          (selectedIndex -
            1 +
            galleryItems.length) %
            galleryItems.length
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedIndex, galleryItems.length]);

  return (
    <>
      {/* Featured Visual Story — Auto Carousel */}
      <div
        className="visual-gallery-featured visual-story-carousel"
        ref={featuredViewportRef}
        aria-roledescription="carousel"
        aria-label="Visual story"
      >
        <div className="visual-story-track">
          {featuredItems.map((item, position) => {
            const index =
              galleryItems.findIndex(
                (galleryItem) =>
                  galleryItem.image === item.image
              );

            return (
              <button
                key={item.image}
                type="button"
                className="visual-gallery-featured-card"
                onClick={() =>
                  setSelectedIndex(index)
                }
                aria-label={`${item.title}, ${item.category}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading={
                    position < 3
                      ? "eager"
                      : "lazy"
                  }
                />

                <div className="visual-gallery-card-overlay" />

                <div className="visual-gallery-card-copy">
                  <small>
                    {item.category}
                  </small>

                  <span>
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Controls */}
      <div className="visual-gallery-controls">
        <div className="visual-gallery-tabs">
          {categories.map(
            (category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category
                    ? "is-active"
                    : ""
                }
                onClick={() => {
                  setActiveCategory(
                    category
                  );
                  setShowAll(true);
                }}
              >
                {category}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          className="visual-gallery-view-all"
          onClick={() =>
            setShowAll((value) => !value)
          }
        >
          {showAll
            ? "Hide all visuals"
            : `Explore all ${galleryItems.length} visuals`}

          <span aria-hidden="true">
            {showAll ? "↑" : "→"}
          </span>
        </button>
      </div>

      {/* All Images */}
      {showAll && (
        <div className="visual-gallery-grid">
          {filteredItems.map(
            (item) => {
              const index =
                galleryItems.findIndex(
                  (galleryItem) =>
                    galleryItem.image ===
                    item.image
                );

              return (
                <button
                  key={item.image}
                  type="button"
                  className="visual-gallery-grid-card"
                  onClick={() =>
                    setSelectedIndex(index)
                  }
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                  />

                  <div className="visual-gallery-card-overlay" />

                  <div className="visual-gallery-grid-copy">
                    <small>
                      {item.category}
                    </small>

                    <span>
                      {item.title}
                    </span>
                  </div>
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Fullscreen Viewer */}
      {selectedItem && (
        <div
          className="visual-gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onClick={() =>
            setSelectedIndex(null)
          }
        >
          <button
            type="button"
            className="visual-gallery-close"
            onClick={() =>
              setSelectedIndex(null)
            }
            aria-label="Close gallery"
          >
            ×
          </button>

          <button
            type="button"
            className="visual-gallery-prev"
            onClick={(event) => {
              event.stopPropagation();

              setSelectedIndex(
                (selectedIndex! -
                  1 +
                  galleryItems.length) %
                  galleryItems.length
              );
            }}
            aria-label="Previous image"
          >
            ←
          </button>

          <div
            className="visual-gallery-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
            />

            <div className="visual-gallery-modal-caption">
              <span>
                {selectedItem.category}
              </span>

              <strong>
                {selectedItem.title}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="visual-gallery-next"
            onClick={(event) => {
              event.stopPropagation();

              setSelectedIndex(
                (selectedIndex! + 1) %
                  galleryItems.length
              );
            }}
            aria-label="Next image"
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
