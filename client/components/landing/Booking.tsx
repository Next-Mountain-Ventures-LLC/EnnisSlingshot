import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function Booking() {
  const [riderCount, setRiderCount] = useState("1");

  const pricePerRider = 79;
  const totalPrice = parseInt(riderCount) * pricePerRider;

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-ennis-darker to-ennis-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Book Your <span className="text-ennis-orange">Experience</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose your adventure and reserve your Slingshot rental today
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
          {/* Video Placeholder */}
          <div className="w-full aspect-video lg:aspect-square bg-gray-900 rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-gray-500 flex-col gap-4">
              <div className="text-6xl">🎥</div>
              [Slingshot Trail Video]
            </div>
          </div>

          {/* Booking Card */}
          <Card className="bg-gray-900/60 border-gray-700 p-8 h-fit">
            <h3 className="text-2xl font-bold text-white mb-6">Your Experience</h3>

            {/* Faux Booking Embed Placeholder */}
            <div className="bg-black/40 border border-dashed border-gray-600 rounded-lg p-8 mb-8">
              <div className="text-center text-gray-500 text-sm">
                <p className="mb-4">📅 Real booking embed will appear here</p>
                <p className="text-xs">This is a placeholder for the actual booking system</p>
              </div>
            </div>

            {/* Rider Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-white mb-4">Select Your Package</h4>
              <RadioGroup value={riderCount} onValueChange={setRiderCount}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-4 border border-gray-700 rounded-lg hover:border-ennis-orange/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="1" id="one-rider" />
                    <Label htmlFor="one-rider" className="flex-1 cursor-pointer">
                      <div className="font-bold text-white">1 Rider</div>
                      <div className="text-sm text-gray-400">You + Professional Driver</div>
                    </Label>
                    <div className="text-ennis-orange font-bold">${pricePerRider}</div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border border-gray-700 rounded-lg hover:border-ennis-orange/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="2" id="two-riders" />
                    <Label htmlFor="two-riders" className="flex-1 cursor-pointer">
                      <div className="font-bold text-white">2 Riders</div>
                      <div className="text-sm text-gray-400">You + 1 Guest</div>
                    </Label>
                    <div className="text-ennis-orange font-bold">${pricePerRider * 2}</div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Duration Info */}
            <div className="bg-ennis-orange/10 border border-ennis-orange/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Duration</p>
                  <p className="text-white font-bold">2 Hours</p>
                </div>
                <div className="text-3xl">⏱️</div>
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-8">
              <h4 className="font-bold text-white mb-3">What's Included</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-ennis-orange font-bold">✓</span>
                  <span>Polaris Slingshot SL Rental (2 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ennis-orange font-bold">✓</span>
                  <span>All Fuel Included</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ennis-orange font-bold">✓</span>
                  <span>Comprehensive Insurance Coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ennis-orange font-bold">✓</span>
                  <span>2026 Bluebonnet Trail Map</span>
                </li>
              </ul>
            </div>

            {/* Price Summary */}
            <div className="border-t border-gray-700 pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Base Price ({riderCount} Rider{parseInt(riderCount) > 1 ? 's' : ''})</span>
                <span className="text-white font-bold">${totalPrice}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-2">
                <span>Total</span>
                <span className="text-ennis-orange">${totalPrice}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Non-refundable but fully reschedulable</p>
            </div>

            {/* CTA Button */}
            <Button className="w-full py-6 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold text-base rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              Continue to Booking
            </Button>
          </Card>
        </div>

        {/* Important Note */}
        <div className="mt-12 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 max-w-5xl mx-auto">
          <p className="text-blue-200 text-sm leading-relaxed">
            <strong>Note:</strong> All riders must be approved by our insurance company to drive. A verification link will be sent to your email after booking. If approval is not granted, your booking will be fully refunded.
          </p>
        </div>
      </div>
    </section>
  );
}
