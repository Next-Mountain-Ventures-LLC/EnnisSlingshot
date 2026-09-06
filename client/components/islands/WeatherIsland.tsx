/**
 * WeatherIsland (SITE-REBUILD-PLAN.md §5, T15).
 *
 * Prerendered: April climate normals (client/lib/weather-normals.ts) +
 * sunrise/sunset + the ride/no-ride policy — all static, crawlable text.
 * Client: <ClientOnly> mounts the live 10-day Open-Meteo forecast above it
 * (fetch, no key; api.open-meteo.com is in the CSP connect-src) with
 * loading / error states and a per-day ride hint.
 */
import { useEffect, useState } from "react";
import { ClientOnly } from "vite-react-ssg";
import {
  APRIL_NORMALS,
  OPEN_METEO_URL,
  RIDE_POLICY_TEXT,
  RIDE_THRESHOLDS,
  rideHint,
  type RideHint,
} from "@/lib/weather-normals";

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: (number | null)[];
  temperature_2m_min: (number | null)[];
  precipitation_probability_max: (number | null)[];
  wind_speed_10m_max: (number | null)[];
}

interface OpenMeteoResponse {
  daily: OpenMeteoDaily;
  daily_units?: Record<string, string>;
}

interface ForecastDay {
  date: string;
  highF: number | null;
  lowF: number | null;
  rainPct: number | null;
  windMph: number | null;
  hint: RideHint;
}

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; days: ForecastDay[]; fetchedAt: Date };

function parseForecast(json: OpenMeteoResponse): ForecastDay[] {
  const d = json.daily;
  return d.time.map((date, i) => {
    const rainPct = d.precipitation_probability_max[i] ?? null;
    const windMph = d.wind_speed_10m_max[i] ?? null;
    return {
      date,
      highF: d.temperature_2m_max[i] ?? null,
      lowF: d.temperature_2m_min[i] ?? null,
      rainPct,
      windMph,
      hint: rideHint(rainPct, windMph),
    };
  });
}

function dayLabel(iso: string): { weekday: string; date: string } {
  const d = new Date(`${iso}T12:00:00`);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

const HINT_STYLE: Record<RideHint, { label: string; className: string }> = {
  good: { label: "Good riding day", className: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/40" },
  watch: { label: "Watch the forecast", className: "bg-amber-500/15 text-amber-200 ring-amber-400/40" },
  "may-reschedule": { label: "We may reschedule", className: "bg-red-500/15 text-red-200 ring-red-400/40" },
};

export function WeatherIsland({ className }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="weather-heading">
      <h2 id="weather-heading" className="text-2xl font-black text-white mb-4">
        Ennis, TX <span className="text-ennis-orange">forecast</span> &amp; April normals
      </h2>

      <ClientOnly fallback={<ForecastPlaceholder />}>{() => <LiveForecast />}</ClientOnly>

      <NormalsCard />
    </section>
  );
}

function ForecastPlaceholder() {
  return (
    <div className="mb-6 rounded-lg border border-dashed border-gray-600 bg-gray-900/60 p-5 text-sm text-gray-400">
      <p className="text-white font-semibold">Live 10-day forecast</p>
      <p className="mt-1">
        The current 10-day outlook for Ennis (32.33°N, 96.63°W) loads in your browser from Open-Meteo. Until it
        does, the typical April conditions below are your planning baseline.
      </p>
    </div>
  );
}

function LiveForecast() {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(OPEN_METEO_URL, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Open-Meteo responded ${r.status}`);
        return r.json() as Promise<OpenMeteoResponse>;
      })
      .then((json) => {
        if (!json?.daily?.time?.length) throw new Error("Forecast payload was empty");
        setState({ status: "ready", days: parseForecast(json), fetchedAt: new Date() });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        setState({ status: "error", message: err instanceof Error ? err.message : "Could not load the forecast" });
      });
    return () => controller.abort();
  }, [reloadKey]);

  if (state.status === "loading") {
    return (
      <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900/60 p-5 text-sm text-gray-400" aria-busy="true">
        <p className="text-white font-semibold">Live 10-day forecast</p>
        <p className="mt-1">Loading the current outlook from Open-Meteo…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900/60 p-5 text-sm text-gray-400" role="alert">
        <p className="text-white font-semibold">Live 10-day forecast unavailable</p>
        <p className="mt-1">
          We couldn't reach Open-Meteo ({state.message}). Use the April normals below for planning, or{" "}
          <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="text-ennis-orange underline">
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900/60 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <p className="text-white font-semibold">Live 10-day forecast</p>
        <p className="text-xs text-gray-500">
          Open-Meteo · fetched{" "}
          {state.fetchedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Day
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                High / Low
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Rain chance
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Max wind
              </th>
              <th scope="col" className="py-2 font-semibold">
                Ride outlook
              </th>
            </tr>
          </thead>
          <tbody>
            {state.days.map((day) => {
              const { weekday, date } = dayLabel(day.date);
              const hint = HINT_STYLE[day.hint];
              return (
                <tr key={day.date} className="border-b border-gray-800 last:border-0">
                  <th scope="row" className="py-2 pr-4 font-medium text-white">
                    {weekday} <span className="text-gray-400 font-normal">{date}</span>
                  </th>
                  <td className="py-2 pr-4 text-gray-200">
                    {day.highF !== null ? `${Math.round(day.highF)}°` : "—"} /{" "}
                    {day.lowF !== null ? `${Math.round(day.lowF)}°` : "—"}
                  </td>
                  <td className="py-2 pr-4 text-gray-200">{day.rainPct !== null ? `${day.rainPct}%` : "—"}</td>
                  <td className="py-2 pr-4 text-gray-200">
                    {day.windMph !== null ? `${Math.round(day.windMph)} mph` : "—"}
                  </td>
                  <td className="py-2">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${hint.className}`}>
                      {hint.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        "We may reschedule" = rain chance ≥ {RIDE_THRESHOLDS.rainProbPct}% or wind ≥ {RIDE_THRESHOLDS.windMph} mph
        that day. Forecast for the Ennis Welcome Center; temperatures in °F, wind in mph, America/Chicago dates.
      </p>
    </div>
  );
}

/** Static April normals + policy — the SSR fallback content, always rendered. */
export function NormalsCard() {
  const n = APRIL_NORMALS;
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-5">
      <p className="text-white font-semibold mb-1">Typical {n.month} in Ennis</p>
      <p className="text-xs text-gray-500 mb-4">
        Climate normals — long-run averages, not a forecast for any specific date.
      </p>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div className="rounded-md bg-black/30 p-3">
          <dt className="text-gray-400">Average high</dt>
          <dd className="text-2xl font-black text-white">{n.avgHighF}°F</dd>
        </div>
        <div className="rounded-md bg-black/30 p-3">
          <dt className="text-gray-400">Average low</dt>
          <dd className="text-2xl font-black text-white">{n.avgLowF}°F</dd>
        </div>
        <div className="rounded-md bg-black/30 p-3">
          <dt className="text-gray-400">Chance of rain on a given day</dt>
          <dd className="text-2xl font-black text-white">~{n.rainDayPct}%</dd>
        </div>
        <div className="rounded-md bg-black/30 p-3">
          <dt className="text-gray-400">Typical mid-April sunrise / sunset</dt>
          <dd className="text-lg font-black text-white">
            {n.sunriseTypical} / {n.sunsetTypical}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-gray-300 leading-relaxed">
        <span className="text-ennis-orange font-semibold">Ride / no-ride policy:</span> {RIDE_POLICY_TEXT}
      </p>
    </div>
  );
}

export default WeatherIsland;
