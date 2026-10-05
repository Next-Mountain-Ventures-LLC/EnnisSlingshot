import { Button } from "@/components/ui/button";
import { HeroVideo } from "@/components/shared/HeroVideo";
import { HERO_VIDEO } from "@/lib/media";

interface HeroProps {
  onBookingClick: () => void;
}

export function Hero({ onBookingClick }: HeroProps) {
  return (
    <section className="relative min-h-[51vh] w-full overflow-hidden bg-ennis-dark flex items-center justify-center">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-gray-800 to-black">
        <HeroVideo
          sources={HERO_VIDEO.sources}
          poster={HERO_VIDEO.poster}
          width={HERO_VIDEO.width}
          height={HERO_VIDEO.height}
        />
        {/* Overlay: the footage is bright (sky, concrete), so darken enough for white text to read */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/75"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 text-center max-w-4xl">
        {/* Logo — hidden on phones (the header already shows it) so the CTA stays above the fold */}
        <div className="mb-8 hidden sm:flex justify-center">
          <img
            src="/logo.png"
            alt="Ennis Slingshot Experience Logo"
            width={300}
            height={300}
            decoding="async"
            className="h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="mb-6 inline-block">
          <span className="inline-block px-3 py-1 bg-black/50 border border-ennis-orange rounded-full text-ennis-orange-bright text-xs font-semibold tracking-widest uppercase">
            ENNIS, TEXAS
          </span>
        </div>

        <h1 className="mb-6 text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight">
          Experience the<br />
          <span className="text-ennis-orange drop-shadow-lg">Thrill of a Lifetime</span>
        </h1>

        <p className="mb-8 text-lg md:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
          Buckle up for an adrenaline-pumping ride in a Polaris Slingshot. Feel the rush as you navigate the stunning bluebonnet trails of Ennis, Texas—the Bluebonnet Capital of Texas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onBookingClick}
            className="h-auto px-8 py-4 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold text-lg rounded-lg transition-colors shadow-lg hover:shadow-2xl"
          >
            Book Your Experience
          </Button>
        </div>

        {/* Season line */}
        <div className="mt-8 md:mt-12">
          <p className="inline-block rounded-full bg-black/50 px-4 py-2 text-sm md:text-base font-semibold text-white">
            🔥 2027 season: April 1–30 · Bluebonnet Festival expected April 17–19
          </p>
        </div>
      </div>
    </section>
  );
}
