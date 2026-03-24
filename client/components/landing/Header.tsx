export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-ennis-dark/95 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img 
            src="https://cdn.builder.io/api/v1/image/assets%2F5193f7a05d654f0c98a0a70f48ef2387%2F700b36c4a653482c8265f6619a61ea23?format=webp&width=80"
            alt="Ennis Slingshot Experience"
            className="h-12 md:h-14 w-auto"
          />
          <div className="hidden sm:block">
            <h1 className="text-white font-black text-lg leading-tight">ENNIS</h1>
            <p className="text-ennis-orange text-xs font-semibold">Slingshot Experience</p>
          </div>
        </a>

        {/* Right side - could add menu or CTA here later */}
        <div />
      </div>
    </header>
  );
}
