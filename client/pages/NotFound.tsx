import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Seo } from "@/components/seo/Seo";

/**
 * Prerendered at /404 → dist/spa/404.html (scripts/split-404.mjs). Netlify
 * serves 404.html with a real 404 status for any path that has no file.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-ennis-dark">
      <Seo
        title="Page Not Found | Ennis Slingshot Experience"
        description="That page doesn't exist. Head back to Ennis Slingshot Experience to book a Polaris Slingshot ride through the Ennis Bluebonnet Trails."
        canonicalPath="/404"
        noindex
      />
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
          <span className="text-ennis-orange">404</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8">Oops! Page not found</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-ennis-orange hover:bg-ennis-orange-bright text-ennis-dark font-bold rounded-lg transition-all"
          >
            Return to Home
          </Link>
          <Link
            to="/slingshot-rental/"
            className="px-6 py-3 border border-gray-600 hover:border-ennis-orange text-gray-200 font-bold rounded-lg transition-all"
          >
            See Experiences
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
