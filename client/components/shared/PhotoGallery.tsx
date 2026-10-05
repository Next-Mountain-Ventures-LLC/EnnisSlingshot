/**
 * /gallery/ widget (frontmatter `widget: PhotoGallery`): a responsive grid of
 * the fleet photos (client/lib/ridePhotos.ts; each links to the full-size
 * image) with the first photo featured at 2×2 — 13 photos fill a 2- or
 * 4-column grid with no orphan — then the ride video as a click-to-play
 * YouTube facade.
 */
import { RIDE_PHOTOS } from "@/lib/ridePhotos";
import { ClickToPlayYouTube } from "@/components/shared/ClickToPlayVideo";
import { cn } from "@/lib/utils";

export const GALLERY_VIDEO_ID = "agWSnFYUvGI";

export function PhotoGallery({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-12", className)}>
      <section aria-labelledby="gallery-photos-heading">
        <h2 id="gallery-photos-heading" className="mb-4 text-2xl font-black text-white md:text-3xl">
          Fleet <span className="text-ennis-orange">photos</span>
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {RIDE_PHOTOS.map((photo, i) => (
            <li key={photo.src} className={cn(i === 0 && "col-span-2 row-span-2")}>
              <a
                href={photo.src}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full overflow-hidden rounded-lg border border-gray-700 bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ennis-orange"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={1200}
                  height={900}
                  loading={i === 0 ? undefined : "lazy"}
                  decoding="async"
                  className={cn(
                    "w-full object-cover transition-opacity duration-300 group-hover:opacity-90",
                    i === 0 ? "aspect-[4/3] h-full" : "aspect-[4/3] h-auto",
                  )}
                />
                <span className="sr-only"> (opens the full-size photo in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="gallery-video-heading">
        <h2 id="gallery-video-heading" className="mb-4 text-2xl font-black text-white md:text-3xl">
          See it in <span className="text-ennis-orange">action</span>
        </h2>
        <ClickToPlayYouTube videoId={GALLERY_VIDEO_ID} title="Polaris Slingshot in action" />
      </section>
    </div>
  );
}

export default PhotoGallery;
