"use client";

import { useState } from "react";

export default function HeroVideo() {
  const [ended, setEnded] = useState(false);

  return (
    <>
      <img
        className={`hero-video-fallback${ended ? " is-visible" : ""}`}
        src="/story-house/34.webp"
        alt=""
        aria-hidden="true"
      />

      <video
        className={ended ? "is-ended" : ""}
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster="/story-house/34.webp"
        onEnded={() => setEnded(true)}
        aria-label="The Story House residential tower"
      >
        <source
          src="/story-house/hero-building.mp4"
          type="video/mp4"
        />
      </video>
    </>
  );
}
