export function Contact() {
  const facebookUrl = "https://www.facebook.com/profile.php?id=61575229691240";

  const handleFacebookShare = () => {
    // Share Facebook page to Facebook
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookUrl)}`;
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

          <button
            onClick={handleFacebookShare}
            className="px-8 py-6 bg-[#1877F2] hover:bg-[#165FE5] text-white font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl inline-flex items-center gap-3"
          >
            📘 Share on Facebook
          </button>
        </div>
      </section>

      {/* Footer Bottom Bar */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
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
