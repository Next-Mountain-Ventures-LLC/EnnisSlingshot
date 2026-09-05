/**
 * April climate normals for Ennis, TX (zip 75119) — the static, crawlable
 * fallback the WeatherIsland renders before (and alongside) the live
 * Open-Meteo forecast. Long-run averages compiled from Wanderlog/WeatherSpark
 * (see client/content/pages/bluebonnets/weather.md); label them as "typical",
 * never as a forecast for a specific date.
 */
export const APRIL_NORMALS = {
  month: "April",
  avgHighF: 78,
  avgLowF: 55,
  /** Chance of measurable rain on any given April day. */
  rainDayPct: 26,
  /** Typical mid-April sunrise / sunset (America/Chicago, CDT). */
  sunriseTypical: "7:05 AM",
  sunsetTypical: "7:55 PM",
} as const;

export type WeatherNormals = typeof APRIL_NORMALS;

/** Open-Meteo forecast point = the Ennis Welcome Center / business geo. */
export const FORECAST_COORDS = { latitude: 32.3293, longitude: -96.6255 } as const;

export const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=32.3293&longitude=-96.6255&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=10";

/** Ride / no-ride thresholds from the reschedule policy. */
export const RIDE_THRESHOLDS = {
  /** Daily max precipitation probability (%) at or above which we may reschedule. */
  rainProbPct: 60,
  /** Daily max wind speed (mph) at or above which we may reschedule. */
  windMph: 30,
} as const;

export const RIDE_POLICY_TEXT =
  "We operate rain or shine unless conditions are genuinely unsafe. If a day shows a 60%+ chance of rain or wind gusting past 30 mph, we may reschedule — guests get a full reschedule at no cost rather than a refund.";

export type RideHint = "good" | "watch" | "may-reschedule";

export function rideHint(precipProbPct: number | null, windMph: number | null): RideHint {
  const rain = precipProbPct ?? 0;
  const wind = windMph ?? 0;
  if (rain >= RIDE_THRESHOLDS.rainProbPct || wind >= RIDE_THRESHOLDS.windMph) return "may-reschedule";
  if (rain >= 40 || wind >= 22) return "watch";
  return "good";
}
