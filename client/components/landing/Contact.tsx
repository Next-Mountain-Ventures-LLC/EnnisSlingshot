import { Button } from "@/components/ui/button";
import { Facebook, Mail, Phone } from "lucide-react";

export function Contact() {
  const handleFacebookShare = () => {
    // Facebook share URL - will be updated with actual Facebook page URL
    const shareUrl = "https://facebook.com/share";
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <footer className="bg-ennis-darker border-t border-gray-700">
      {/* Share Section */}
      <section className="py-16 md:py-20 border-b border-gray-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Share the <span className="text-ennis-orange">Thrill</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Invite your friends and family to experience the adrenaline rush of a lifetime. Let them book their Slingshot adventure today.
          </p>

          <Button
            onClick={handleFacebookShare}
            className="px-8 py-6 bg-[#1877F2] hover:bg-[#165FE5] text-white font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl inline-flex items-center gap-3"
          >
            <Facebook className="w-5 h-5" />
            Share on Facebook
          </Button>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {/* Email */}
            <div className="text-center">
              <div className="inline-block p-4 bg-ennis-orange/10 border border-ennis-orange/30 rounded-lg mb-4">
                <Mail className="w-8 h-8 text-ennis-orange" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email</h3>
              <a
                href="mailto:info@example.com"
                className="text-gray-400 hover:text-ennis-orange transition-colors break-all"
              >
                [Your Email]
              </a>
            </div>

            {/* Phone */}
            <div className="text-center">
              <div className="inline-block p-4 bg-ennis-orange/10 border border-ennis-orange/30 rounded-lg mb-4">
                <Phone className="w-8 h-8 text-ennis-orange" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Phone</h3>
              <a
                href="tel:+14155551234"
                className="text-gray-400 hover:text-ennis-orange transition-colors"
              >
                [Your Phone]
              </a>
            </div>

            {/* Social */}
            <div className="text-center">
              <div className="inline-block p-4 bg-ennis-orange/10 border border-ennis-orange/30 rounded-lg mb-4">
                <Facebook className="w-8 h-8 text-ennis-orange" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Follow Us</h3>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-ennis-orange transition-colors"
              >
                Facebook Page
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h4 className="text-white font-bold mb-1">ENNIS SLINGSHOT EXPERIENCE</h4>
                <p className="text-gray-500 text-sm">
                  Ennis, Texas — Bluebonnet Capital of Texas
                </p>
              </div>

              <div className="text-gray-500 text-sm text-center">
                <p>© 2026 Ennis Slingshot Experience. All rights reserved.</p>
                <p className="mt-2">🌸 Wild rides available April 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
