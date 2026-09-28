/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";

type PropertyGalleryProps = {
  images: string[];
  title: string;
};

export default function PropertyGallery({
  images,
  title,
}: PropertyGalleryProps) {
  const validImages = images.filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const currentImage = validImages[activeIndex] || "";

  const previousImage = () => {
    setActiveIndex((current) =>
      current === 0 ? validImages.length - 1 : current - 1
    );
  };

  const nextImage = () => {
    setActiveIndex((current) =>
      current === validImages.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (event.key === "ArrowLeft") {
        previousImage();
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, validImages.length]);

  if (validImages.length === 0) {
    return (
      <div className="flex h-105 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
        No images available
      </div>
    );
  }

  return (
    <>
      {/* GALLERY */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* MAIN IMAGE */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative h-105 overflow-hidden rounded-2xl md:col-span-2"
        >
          <img
            src={currentImage}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
            <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold opacity-0 shadow transition group-hover:opacity-100">
              View All Photos
            </span>
          </div>
        </button>

        {/* SIDE IMAGES */}
        <div className="grid gap-4">
          {/* SECOND IMAGE */}
          <button
            type="button"
            onClick={() => {
              setActiveIndex(Math.min(1, validImages.length - 1));
              setIsOpen(true);
            }}
            className="group relative h-50.5 overflow-hidden rounded-2xl"
          >
            <img
              src={validImages[Math.min(1, validImages.length - 1)]}
              alt={`${title} interior`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </button>

          {/* THIRD IMAGE */}
          <button
            type="button"
            onClick={() => {
              setActiveIndex(Math.min(2, validImages.length - 1));
              setIsOpen(true);
            }}
            className="group relative h-50.5 overflow-hidden rounded-2xl"
          >
            <img
              src={validImages[Math.min(2, validImages.length - 1)]}
              alt={`${title} room`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            {/* VIEW ALL */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
              <span className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold shadow">
                View All Photos
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* LIGHTBOX */}
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/90 p-4">
          {/* CLOSE */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close gallery"
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-bold text-slate-900 shadow-lg transition hover:bg-slate-200"
          >
            ✕
          </button>

          {/* COUNTER */}
          <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900">
            {activeIndex + 1} / {validImages.length}
          </div>

          {/* PREVIOUS */}
          {validImages.length > 1 && (
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-900 shadow-lg transition hover:bg-slate-200 md:left-8"
            >
              ‹
            </button>
          )}

          {/* IMAGE */}
          <div className="flex h-full w-full items-center justify-center">
            <img
              src={currentImage}
              alt={`${title} ${activeIndex + 1}`}
              className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain"
            />
          </div>

          {/* NEXT */}
          {validImages.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-900 shadow-lg transition hover:bg-slate-200 md:right-8"
            >
              ›
            </button>
          )}

          {/* THUMBNAILS */}
          {validImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl bg-black/60 p-2">
              {validImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeIndex === index
                      ? "border-amber-400"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}