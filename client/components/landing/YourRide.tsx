import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slinghotImages = [
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2Fe39c4213da65452e98b5548910b3b284?alt=media&token=a5d3f0be-0184-4efe-8aca-0d18dce4f391&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F0d546bc2ae0a43c18613bd973d2952af?alt=media&token=66fa2bc5-8074-4746-a7a6-4f997d5a3601&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F2c39661ec4ae4209a6daf64d41cdc94c?alt=media&token=4f7921d1-1e47-4490-8d93-eb50f44835f7&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F9cd4ce539dd74c1784b207dbf6c9e5af?alt=media&token=9b7e1c2a-2d8c-4425-9cbb-48b3704a03c6&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2Fd984dc2a291144d9938527c9bd2be808?alt=media&token=41737bc8-1f98-4a65-89c7-d12653facee6&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2Ff80262cdb9ae44cfa839c74514d80fd8?alt=media&token=8f6a0681-a1c8-4b9b-9e68-f0e1f36798d3&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2Ff4b3a78874754cfa8706c1edb4a60fc2?alt=media&token=c57dc546-e82b-43fb-a04e-f06dbd85450f&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2Ffca2f1b89f4548ee83d34ff7d9305e0c?alt=media&token=3653b76d-27e4-4375-bc01-4e4df7305873&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F378d867a656446c5a02c0ce805902d98?alt=media&token=0efe5ad2-8ac9-4cb8-b639-4546a6d8b4ac&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F057a26a6120e40a1ba38b7b65743b3a1?alt=media&token=685db77f-83b7-47a5-b7ab-5039639062ce&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F1c60fe8d714b489cb0fa4c0b1c9bb93a?alt=media&token=7b3b70ab-8273-4e98-b919-dbaa4f5bbe40&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2Fa06a882a0a104062880c906f8ebbe456?alt=media&token=f593b6c9-3c5a-4ee7-87a1-efc500efbc32&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
  "https://cdn.builder.io/o/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F81decbd43eaa4dc89fa7164ce7e2c0cf?alt=media&token=124cdd2f-49b3-4abe-a07a-b9c7e0dd8fc6&apiKey=5193f7a05d654f0c98a0a70f48ef2387",
];

export function YourRide() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? slinghotImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === slinghotImages.length - 1 ? 0 : prev + 1
    );
  };
  const specs = [
    { label: "Engine", value: "1.5L Twin-Cylinder" },
    { label: "Horsepower", value: "203 HP" },
    { label: "Torque", value: "144 lb-ft" },
    { label: "Transmission", value: "Automatic CVT" },
    { label: "0-60 MPH", value: "~5.2 seconds" },
    { label: "Top Speed", value: "125+ MPH" },
    { label: "Seats", value: "2 (Driver + Rider)" },
    { label: "License Required", value: "Valid Driver's License" },
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-ennis-dark to-ennis-darker">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Your Ride: <span className="text-ennis-orange">Polaris Slingshot SLR</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The ultimate 3-wheeled adrenaline machine. Engineered for performance, designed for thrills.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Image Carousel */}
          <div className="relative">
            <div className="w-full aspect-video md:aspect-square bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative">
              <img
                src={slinghotImages[currentImageIndex]}
                alt={`Polaris Slingshot SLR ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Navigation Buttons */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Image Counter */}
            <div className="text-center mt-4 text-gray-400 text-sm">
              {currentImageIndex + 1} of {slinghotImages.length}
            </div>
          </div>

          {/* Specs Grid */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {specs.map((spec, idx) => (
                <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-ennis-orange/50 transition-colors">
                  <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">{spec.label}</p>
                  <p className="text-white font-bold text-lg">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-8 md:p-12">
          <h3 className="text-2xl font-bold text-white mb-6">Why Choose Slingshot SLR?</h3>
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
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/agWSnFYUvGI?si=BP2d6OCmL4XXWm5n"
              title="Polaris Slingshot SLR"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
