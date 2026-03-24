import { Button } from "@/components/ui/button";

interface HeroProps {
  onBookingClick: () => void;
}

export function Hero({ onBookingClick }: HeroProps) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-ennis-dark flex items-center justify-center">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://blog.nxtmt.ventures/1744504370711-mov/"
        />
        {/* Overlay gradient for text readability - lighter to show video */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center max-w-4xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F700b36c4a653482c8265f6619a61ea23?format=webp&width=300"
            alt="Ennis Slingshot Experience Logo"
            className="h-32 md:h-40 w-auto drop-shadow-2xl"
          />
        </div>

        <div className="mb-6 inline-block">
          <span className="inline-block px-3 py-1 bg-ennis-orange/20 border border-ennis-orange rounded-full text-ennis-orange text-xs font-semibold tracking-widest uppercase">
            ENNIS, TEXAS
          </span>
        </div>

        <h1 className="mb-6 text-5xl md:text-7xl font-black text-white leading-tight">
          Experience the<br />
          <span className="text-ennis-orange drop-shadow-lg">Thrill of a Lifetime</span>
        </h1>

        <p className="mb-8 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Buckle up for an adrenaline-pumping ride in a Polaris Slingshot SL. Feel the rush as you navigate the stunning bluebonnet trails of Ennis, Texas—the Bluebonnet Capital of Texas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onBookingClick}
            className="px-8 py-6 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
          >
            Book Your Experience
          </Button>
        </div>

        {/* Badge */}
        <div className="mt-12 pt-8 border-t border-gray-600">
          <p className="text-sm text-gray-400 uppercase tracking-widest">
            🔥 Wild rides available April 2026
          </p>
        </div>
      </div>
    </section>
  );
}
