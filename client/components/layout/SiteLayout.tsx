/**
 * Layout wrapping every route: global Header nav, page content (<Outlet/>),
 * mobile StickyBookBar, the Contact footer (NAP) and the ConsentBanner. Breadcrumbs are rendered
 * by the individual page templates (they know their hub), not here.
 */
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Contact } from "@/components/landing/Contact";
import { StickyBookBar, isBookPath } from "@/components/layout/StickyBookBar";
import { ConsentBanner } from "@/components/shared/ConsentBanner";
import { SignupPopup } from "@/components/signup/SignupPopup";
import { Seo } from "@/components/seo/Seo";
import { business } from "@shared/business";

export function SiteLayout({ children }: { children?: React.ReactNode }) {
  const { pathname } = useLocation();
  const hasStickyBar = !isBookPath(pathname);
  return (
    // Bottom padding on phones = height of the fixed StickyBookBar (+ safe area) so it never covers the footer.
    <div
      className={`min-h-screen flex flex-col bg-ennis-dark ${
        hasStickyBar ? "pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0" : ""
      }`}
    >
      {/*
        Site-wide defaults; every page's own <Seo> overrides these. No canonical
        here: each page sets its own, and a default would leak onto pages that
        deliberately have none (the 404).
      */}
      <Seo
        title={`${business.name} — Drive a Polaris Slingshot Through the Bluebonnet Capital of Texas`}
        description={business.description}
      />
      <Header />
      <main id="main" className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Contact />
      <StickyBookBar />
      <ConsentBanner />
      <SignupPopup />
    </div>
  );
}

export default SiteLayout;
