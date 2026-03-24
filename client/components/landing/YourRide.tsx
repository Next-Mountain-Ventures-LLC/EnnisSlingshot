import { Card } from "@/components/ui/card";

export function YourRide() {
  const specs = [
    { label: "Engine", value: "1.5L Twin-Cylinder" },
    { label: "Horsepower", value: "203 HP" },
    { label: "Torque", value: "144 lb-ft" },
    { label: "Transmission", value: "Automatic CVT" },
    { label: "0-60 MPH", value: "~5.2 seconds" },
    { label: "Top Speed", value: "120+ MPH" },
    { label: "Seats", value: "2 (Driver + Rider)" },
    { label: "License Required", value: "Valid Driver's License" },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-ennis-dark to-ennis-darker">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Your Ride: <span className="text-ennis-orange">Polaris Slingshot SL</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The ultimate 3-wheeled adrenaline machine. Engineered for performance, designed for thrills.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Image Placeholder */}
          <div className="w-full aspect-video md:aspect-square bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-500">
              [Polaris Slingshot SL Image]
            </div>
          </div>

          {/* Specs Grid */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {specs.map((spec, idx) => (
                <Card key={idx} className="bg-gray-900/50 border-gray-700 p-4 hover:border-ennis-orange/50 transition-colors">
                  <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">{spec.label}</p>
                  <p className="text-white font-bold text-lg">{spec.value}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-8 md:p-12">
          <h3 className="text-2xl font-bold text-white mb-6">Why Choose Slingshot SL?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-ennis-orange font-bold mb-2 text-lg">⚡ High Performance</h4>
              <p className="text-gray-300">
                Automatic transmission makes it easy to drive. No special license needed—just a valid driver's license and a desire for speed.
              </p>
            </div>
            <div>
              <h4 className="text-ennis-orange font-bold mb-2 text-lg">🛡️ Safety First</h4>
              <p className="text-gray-300">
                All riders benefit from comprehensive insurance coverage included with your rental. All drivers must be approved before booking.
              </p>
            </div>
            <div>
              <h4 className="text-ennis-orange font-bold mb-2 text-lg">🚗 Easy to Drive</h4>
              <p className="text-gray-300">
                The intuitive handling and automatic transmission make this machine accessible to anyone with driving experience.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Video Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">See It in Action</h3>
          <div className="w-full aspect-video bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-gray-500 flex-col gap-4">
              <div className="text-4xl">▶️</div>
              [Polaris Slingshot SL Video - YouTube Embed]
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
