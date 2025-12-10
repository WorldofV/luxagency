"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type GalleryImage = {
  id: string;
  url: string;
};

type ModelGalleryProps = {
  images: GalleryImage[];
  name: string;
};

export function ModelGallery({ images, name }: ModelGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      }
      if (event.key === "ArrowRight") {
        setLightboxIndex((prev) => {
          if (prev === null) return prev;
          return Math.min(images.length - 1, prev + 1);
        });
      }
      if (event.key === "ArrowLeft") {
        setLightboxIndex((prev) => {
          if (prev === null) return prev;
          return Math.max(0, prev - 1);
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, images.length]);

  if (!images.length) {
    return (
      <div className="space-y-6">
        <div className="aspect-[3/4] w-full overflow-hidden rounded-[36px] border border-[var(--border-color)] bg-gradient-to-br from-neutral-200 via-white to-neutral-100 text-center text-xs uppercase tracking-[0.4em] text-[var(--muted)] flex items-center justify-center">
          <span>Book imagery coming soon</span>
        </div>
      </div>
    );
  }

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = () =>
    setLightboxIndex((prev) => {
      if (prev === null) return prev;
      return Math.max(0, prev - 1);
    });

  const showNext = () =>
    setLightboxIndex((prev) => {
      if (prev === null) return prev;
      return Math.min(images.length - 1, prev + 1);
    });

  const currentImage =
    lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="aspect-[3/4] w-full overflow-hidden rounded-[36px] border border-[var(--border-color)] bg-white"
        >
          <Image
            src={images[0].url}
            alt={name}
            width={900}
            height={1200}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            priority
            unoptimized
          />
        </button>

        {images.length > 1 ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              Book
            </p>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {images.slice(1).map((image, index) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => openLightbox(index + 1)}
                  className="aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white"
                >
                  <Image
                    src={image.url}
                    alt={`${name} look ${index + 2}`}
                    width={600}
                    height={800}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {currentImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeLightbox}
        >
          <div
            className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded-[32px] border border-white/20 bg-black/50 p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={currentImage.url}
              alt={`${name} enlarged`}
              width={1000}
              height={1400}
              className="max-h-[80vh] w-full rounded-2xl object-contain"
              unoptimized
            />
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.4em] text-white">
              <button
                type="button"
                onClick={showPrev}
                disabled={lightboxIndex === 0}
                className="flex-1 rounded-full border border-white/50 px-4 py-2 disabled:opacity-30 sm:flex-none"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={showNext}
                disabled={lightboxIndex === images.length - 1}
                className="flex-1 rounded-full border border-white/50 px-4 py-2 disabled:opacity-30 sm:flex-none"
              >
                Next
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="flex-1 rounded-full border border-white/70 px-4 py-2 sm:flex-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

