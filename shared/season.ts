/**
 * Season + festival dates used in UI copy (signup forms, banners). Markdown
 * pages can't import this — keep their wording in step with it.
 *
 * 2027 festival dates are the expected weekend (owner, 2026-10-03), not yet
 * officially announced: always present them as "expected" / "subject to change".
 */
export const SEASON_YEAR = 2027;

export const TRAILS_2027 = {
  start: "2027-04-01",
  end: "2027-04-30",
  label: "April 1–30, 2027",
} as const;

export const FESTIVAL_2027 = {
  start: "2027-04-17",
  end: "2027-04-19",
  label: "April 17–19, 2027",
  confirmed: false,
} as const;
