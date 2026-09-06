/**
 * Polaris Slingshot vehicle specification — single source of truth for every
 * spec that appears in copy (YourRide specs grid, promo popup, page content).
 *
 * The previous site copy ("1.5L Twin-Cylinder / 203 HP / Automatic CVT") was
 * wrong. Polaris publishes the Slingshot with a ProStar 2.0L four-cylinder;
 * output depends on trim (see `hpByTrim`). Transmission is AutoDrive (an
 * automated manual — no clutch pedal) or a 5-speed manual, never a CVT.
 */

export interface TrimSpec {
  /** Trim names sharing this tune. */
  trims: readonly string[];
  horsepower: number;
  /** Peak torque in lb-ft. */
  torqueLbFt: number;
}

export const vehicleSpec = {
  make: "Polaris",
  model: "Slingshot",
  /** Trim the fleet is marketed as on the site. */
  fleetTrim: "SLR",
  displayName: "Polaris Slingshot SLR",
  bodyStyle: "Three-wheel autocycle (2 front wheels, 1 rear), open cockpit",
  wheels: 3,

  engine: "Polaris ProStar 2.0L four-cylinder",
  engineShort: "ProStar 2.0L 4-cylinder",

  hpByTrim: [
    { trims: ["S", "SL"], horsepower: 180, torqueLbFt: 120 },
    {
      trims: ["SLR", "R", "Signature", "Grand Touring"],
      horsepower: 204,
      torqueLbFt: 144,
    },
  ] as const satisfies readonly TrimSpec[],

  transmission:
    "AutoDrive automated manual (no clutch) or 5-speed manual",
  transmissionShort: "AutoDrive — no clutch, drives like a car",

  seating: 2,
  seatingLabel: "2 (Driver + Rider)",

  /**
   * Texas classifies the Slingshot as an autocycle: a standard Class C
   * driver's license is sufficient (Tex. Transp. Code §521.085(b)); no
   * motorcycle license or endorsement is required.
   */
  licenseNote: "Valid driver's license — no motorcycle license required",
  licenseShort: "Valid Driver's License",
} as const;

/** "180–204 HP (by trim)" style label for the specs grid. */
export function horsepowerRangeLabel(): string {
  const hps = vehicleSpec.hpByTrim.map((t) => t.horsepower);
  const min = Math.min(...hps);
  const max = Math.max(...hps);
  return min === max ? `${max} HP` : `${min}–${max} HP (by trim)`;
}

/** "120–144 lb-ft (by trim)" style label. */
export function torqueRangeLabel(): string {
  const tq = vehicleSpec.hpByTrim.map((t) => t.torqueLbFt);
  const min = Math.min(...tq);
  const max = Math.max(...tq);
  return min === max ? `${max} lb-ft` : `${min}–${max} lb-ft (by trim)`;
}

/** Spec for a named trim (e.g. "SLR"), or undefined if unknown. */
export function specForTrim(trim: string): TrimSpec | undefined {
  return vehicleSpec.hpByTrim.find((t) =>
    t.trims.some((name) => name.toLowerCase() === trim.toLowerCase()),
  );
}
