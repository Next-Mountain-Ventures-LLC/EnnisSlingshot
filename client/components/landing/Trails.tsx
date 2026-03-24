import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function Trails() {
  return (
    <section className="py-20 md:py-32 bg-ennis-dark relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-ennis-orange rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-ennis-red rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="mb-4 inline-block">
              <span className="px-3 py-1 bg-ennis-orange/20 border border-ennis-orange rounded-full text-ennis-orange text-xs font-semibold tracking-widest uppercase">
                SCENIC ROUTES
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Explore the <span className="text-ennis-orange">Bluebonnet Trails</span>
            </h2>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              Ennis is the Bluebonnet Capital of Texas, and our carefully curated trail maps will take you through some of the most scenic routes in the state. Wind through historic countryside, witness stunning wildflower displays, and experience Texas beauty from the most exciting vantage point possible.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="text-ennis-orange text-xl mt-1">🌸</div>
                <div>
                  <h4 className="font-bold text-white mb-1">Scenic Bluebonnet Routes</h4>
                  <p className="text-gray-400">Specially selected trails featuring the most beautiful wildflower landscapes</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-ennis-orange text-xl mt-1">📍</div>
                <div>
                  <h4 className="font-bold text-white mb-1">Expert-Curated Maps</h4>
                  <p className="text-gray-400">2026 Bluebonnet Trail Maps included in your glove box</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-ennis-orange text-xl mt-1">⏱️</div>
                <div>
                  <h4 className="font-bold text-white mb-1">2-Hour Adventure</h4>
                  <p className="text-gray-400">Plenty of time to explore and experience the trails at your pace</p>
                </div>
              </div>
            </div>

            <Button
              asChild
              className="px-6 py-6 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold text-base rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              <a href="#" download className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download 2026 Trail Map
              </a>
            </Button>
          </div>

          {/* Image Placeholder */}
          <div className="w-full aspect-square bg-gray-900 rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500 flex-col gap-4">
              <div className="text-6xl">🗺️</div>
              [Bluebonnet Trail Map / Scenic Landscape]
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-16 bg-gradient-to-r from-ennis-orange/10 to-ennis-red/10 border border-ennis-orange/30 rounded-lg p-8">
          <h3 className="text-xl font-bold text-white mb-3">About Ennis Bluebonnets</h3>
          <p className="text-gray-300 leading-relaxed">
            Every spring, Ennis, Texas bursts into a spectacular display of bluebonnets, transforming the rolling hills and meadows into a sea of deep purple blooms. This natural wonder has earned Ennis the prestigious title of "Bluebonnet Capital of Texas." Combine this breathtaking scenery with the exhilaration of driving a Slingshot, and you have an unforgettable experience.
          </p>
        </div>
      </div>
    </section>
  );
}
