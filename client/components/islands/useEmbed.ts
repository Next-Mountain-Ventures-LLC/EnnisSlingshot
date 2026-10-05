/**
 * Legacy: third-party embeds now use the dedicated, prerendered /embed/*
 * routes (client/pages/embed/) — `?embed=1` can't get its own Netlify headers
 * (header rules ignore query strings), so it is never frameable cross-site.
 * Nothing imports this any more; kept for reference.
 *
 * `?embed=1` chrome-less flag for embeddable islands (trail map for
 * bloggers). Prerendered HTML never has query params, so the flag is read
 * after mount to keep hydration identical to the server output; the page
 * re-renders chrome-less one tick later.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useEmbed(): boolean {
  const [params] = useSearchParams();
  const wanted = params.get("embed") === "1";
  const [embed, setEmbed] = useState(false);
  useEffect(() => {
    setEmbed(wanted);
  }, [wanted]);
  return embed;
}
