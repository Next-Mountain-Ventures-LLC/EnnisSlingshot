/**
 * Layout for the /embed/* widgets that other sites iframe. Deliberately NOT
 * SiteLayout: no header, footer, sticky Book bar, consent banner or signup
 * popup — just the widget. index.html skips GA config and the Meta Pixel on
 * /embed/ paths, and netlify.toml leaves /embed/* frameable (X-Robots-Tag
 * noindex). Every link inside an embed opens in a new tab.
 */
import { Outlet } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { business } from "@shared/business";

export function EmbedLayout() {
  return (
    <div className="min-h-screen bg-ennis-dark text-white antialiased">
      {/* Fallback head for the embed tree; each embed page sets its own <Seo>. */}
      <Seo title={business.name} description={business.description} noindex />
      <Outlet />
    </div>
  );
}

export default EmbedLayout;
