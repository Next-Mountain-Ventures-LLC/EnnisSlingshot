/**
 * Layout wrapping every route: global Header nav, page content (<Outlet/>),
 * mobile StickyBookBar, the Contact footer (NAP) and the ConsentBanner. Breadcrumbs are rendered
 * by the individual page templates (they know their hub), not here.
 */
import { Outlet } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Contact } from "@/components/landing/Contact";
import { StickyBookBar } from "@/components/layout/StickyBookBar";
import { ConsentBanner } from "@/components/shared/ConsentBanner";
import { Seo } from "@/components/seo/Seo";
import { business } from "@shared/business";

export function SiteLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-ennis-dark pb-16 md:pb-0">
      {/* Site-wide defaults; every page's own <Seo> overrides these. */}
      <Seo
        title={`${business.name} — Drive a Polaris Slingshot Through the Bluebonnet Capital of Texas`}
        description={business.description}
        canonicalPath="/"
      />
      <Header />
      <main id="main" className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Contact />
      <StickyBookBar />
      <ConsentBanner />
    </div>
  );
}

export default SiteLayout;
