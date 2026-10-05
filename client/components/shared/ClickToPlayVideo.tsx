/**
 * Poster + play button; the <video> element (and its network request) only
 * exists after the visitor clicks. Reuses the same source URL as HeroVideo so
 * the browser cache serves it instead of a second download. Respects
 * `prefers-reduced-motion` by never autoplaying (the click is still honored).
 */
import { useEffect, useRef, useState } from "react";
import { normalizeSources, type HeroVideoProps } from "./HeroVideo";

export interface ClickToPlayVideoProps {
  sources: HeroVideoProps["sources"];
  poster: string;
  width?: number;
  height?: number;
  /** Accessible label for the play button. */
  label?: string;
  className?: string;
  /** Start muted (default true); a mute toggle is shown while playing. */
  muted?: boolean;
}

export function ClickToPlayVideo({
  sources,
  poster,
  width = 1920,
  height = 1080,
  label = "Play video",
  className = "",
  muted: initialMuted = true,
}: ClickToPlayVideoProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(initialMuted);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing) return;
    ref.current?.play().catch(() => setPlaying(false));
  }, [playing]);

  const list = normalizeSources(sources);

  return (
    <div className={`relative w-full aspect-video bg-gray-900 rounded-lg border border-gray-700 overflow-hidden group ${className}`}>
      {playing ? (
        <>
          <video
            ref={ref}
            controls
            loop
            playsInline
            muted={muted}
            poster={poster}
            width={width}
            height={height}
            preload="auto"
            className="w-full h-full object-cover"
          >
            {list.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
            <img src={poster} alt="" width={width} height={height} loading="lazy" decoding="async" />
          </video>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="absolute bottom-4 right-4 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold py-2 px-4 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-pressed={!muted}
            title={muted ? "Unmute audio" : "Mute audio"}
          >
            {muted ? "🔊 Unmute" : "🔇 Mute"}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={label}
          className="absolute inset-0 w-full h-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-ennis-orange"
        >
          <img
            src={poster}
            alt=""
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-ennis-orange text-ennis-dark flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"
          >
            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}

export interface ClickToPlayYouTubeProps {
  /** YouTube video id (e.g. "agWSnFYUvGI"). */
  videoId: string;
  /** Video title — iframe title and play-button label. */
  title: string;
  className?: string;
}

/**
 * YouTube facade: a static poster (i.ytimg.com) + play button. The
 * youtube-nocookie.com iframe — and YouTube's ~1 MB of JS and its cookies —
 * only load after the visitor clicks. Both hosts are already allowed by the
 * CSP in netlify.toml (img-src i.ytimg.com, frame-src www.youtube-nocookie.com).
 */
export function ClickToPlayYouTube({ videoId, title, className = "" }: ClickToPlayYouTubeProps) {
  const [playing, setPlaying] = useState(false);
  const id = encodeURIComponent(videoId);

  return (
    <div className={`relative w-full aspect-video bg-gray-900 rounded-lg border border-gray-700 overflow-hidden group ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          width={1280}
          height={720}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="absolute inset-0 w-full h-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-ennis-orange"
        >
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-ennis-orange text-ennis-dark flex items-center justify-center shadow-2xl transition-colors group-hover:bg-ennis-orange-bright"
          >
            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}

export default ClickToPlayVideo;
