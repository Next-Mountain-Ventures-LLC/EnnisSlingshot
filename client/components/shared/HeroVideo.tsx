/**
 * Background hero video: muted autoplay loop, `preload="metadata"`, a real
 * poster (the LCP image — eager + fetchpriority high), and an <img> fallback
 * inside <video> for browsers that can't play the source.
 *
 * Honors `prefers-reduced-motion`: for those users the <source> elements are
 * never attached, so only the poster shows and no video bytes are fetched.
 * Sources are attached client-side once the element is near the viewport
 * (the prerendered HTML has none), so the static HTML alone never triggers
 * the download. The DOM shape is identical on server and client (img +
 * source-less video), so hydration never mismatches. The Booking section's
 * ClickToPlayVideo shares the same URL, so the browser cache serves the
 * second <video> when it is finally played.
 */
import { useEffect, useRef, useState } from "react";
import { LCP_IMG_PROPS } from "@/lib/media";

export interface VideoSource {
  src: string;
  type: string;
}

export interface HeroVideoProps {
  sources: readonly VideoSource[] | VideoSource | string;
  poster: string;
  /** Intrinsic size of the poster (CLS). */
  width?: number;
  height?: number;
  className?: string;
  /** Alt text for the poster/fallback image (decorative by default). */
  alt?: string;
}

export function normalizeSources(sources: HeroVideoProps["sources"]): VideoSource[] {
  if (typeof sources === "string") return [{ src: sources, type: guessType(sources) }];
  return Array.isArray(sources) ? [...sources] : [sources as VideoSource];
}

function guessType(src: string): string {
  const ext = src.split("?")[0]!.split(".").pop()!.toLowerCase();
  return { webm: "video/webm", mov: "video/mp4", m4v: "video/mp4", ogv: "video/ogg" }[ext] ?? "video/mp4";
}

/** SSR-safe reduced-motion hook: false on the server / first paint, updates after hydration. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

export function HeroVideo({ sources, poster, width = 1920, height = 1080, className = "", alt = "" }: HeroVideoProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const showVideo = active && !reduced;

  // Only start fetching/playing once mounted and visible (IntersectionObserver).
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !showVideo) return;
    // <source> children were just added — reload so the element picks them up, then autoplay.
    el.load();
    el.play().catch(() => {
      /* autoplay blocked — poster stays visible */
    });
  }, [showVideo]);

  const list = normalizeSources(sources);

  return (
    <>
      {/* Poster as a real <img> so it is the LCP candidate and paints before the video decodes. */}
      <img
        src={poster}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        aria-hidden={alt ? undefined : true}
        className="absolute inset-0 w-full h-full object-cover"
        {...LCP_IMG_PROPS}
      />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        width={width}
        height={height}
        aria-hidden="true"
        tabIndex={-1}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      >
        {showVideo && list.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
        {/* Fallback for browsers that can't play <video> at all */}
        <img src={poster} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      </video>
    </>
  );
}

export default HeroVideo;
