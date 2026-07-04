/**
 * jyotish.js — Vedic (Parashari) Jyotish calculation engine for AstroVaidhya.
 *
 * Pure Node.js implementation (no npm packages). Computes a full Kundali
 * (birth chart) from date/time/place of birth: planetary positions (Lahiri
 * sidereal), Lagna, houses (Whole Sign), Navamsa (D9), Vimshottari Dasha +
 * Antardasha, Ashtakavarga, retrograde/combustion status, live transits, and
 * classical yoga/dosha flags.
 *
 * The planetary-position formulas here are a well-known "simplified VSOP87"
 * style approximation (mean orbital elements + a truncated equation-of-center
 * series, plus a handful of named periodic correction terms for the Moon and
 * the lunar node). This trades a small amount of astronomical precision
 * (arc-minute level) for a compact, dependency-free implementation — adequate
 * for narrative astrology readings, not for eclipse/occultation-grade work.
 *
 * module.exports = { calculateKundali }
 */

// ── Constants ────────────────────────────────────────────────────────────────

const J2000 = 2451545.0; // Julian Day of the J2000.0 epoch (2000-01-01 12:00 TT)

const GRAHA_ORDER = ['Surya', 'Chandra', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani', 'Rahu', 'Ketu'];
const BODY_GRAHAS = ['Surya', 'Chandra', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani']; // the 7 classical grahas (no nodes)

const RASHI_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

// Rashi lord (dispositor) for each rashi index 0–11 — used for Neecha Bhanga.
const RASHI_LORDS = ['Mangal', 'Shukra', 'Budh', 'Chandra', 'Surya', 'Budh', 'Shukra', 'Mangal', 'Guru', 'Shani', 'Shani', 'Guru'];

// Element cycle by rashi index (0=Fire, 1=Earth, 2=Air, 3=Water), used for Navamsa.
const RASHI_ELEMENTS = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
// Navamsa starting rashi index for each element.
const ELEMENT_NAVAMSA_START = { 0: 0, 1: 9, 2: 6, 3: 3 }; // Fire->Mesha(0), Earth->Makara(9), Air->Tula(6), Water->Karka(3)

// Exaltation / debilitation / own-sign rashi indices (BPHS standard).
const EXALTATION = { Surya: 0, Chandra: 1, Mangal: 9, Budh: 5, Guru: 3, Shukra: 11, Shani: 6 };
const DEBILITATION = { Surya: 6, Chandra: 7, Mangal: 3, Budh: 11, Guru: 9, Shukra: 5, Shani: 0 };
const OWN_SIGN = {
  Surya: [4], Chandra: [3], Mangal: [0, 7], Budh: [2, 5], Guru: [8, 11], Shukra: [1, 6], Shani: [9, 10],
};

// Vedic special-aspect house offsets (0-indexed steps from the planet's own house).
// Every graha aspects its 7th house (offset 6); Mangal/Guru/Shani have extra aspects.
const ASPECT_OFFSETS = {
  Mangal: [3, 6, 7], // 4th, 7th, 8th
  Guru: [4, 6, 8],   // 5th, 7th, 9th
  Shani: [2, 6, 9],  // 3rd, 7th, 10th
};

// Combustion (Asta) orbs in degrees, per graha. Sun/Rahu/Ketu are excluded —
// combustion is only defined relative to the Sun for the other 6 grahas.
const COMBUST_ORBS = { Chandra: 12, Mangal: 17, Budh: 14, Guru: 11, Shukra: 10, Shani: 15 };

// Vimshottari Dasha lord sequence (starting from Ashwini's lord, Ketu) and years.
const DASHA_ORDER = ['Ketu', 'Shukra', 'Surya', 'Chandra', 'Mangal', 'Rahu', 'Guru', 'Shani', 'Budh'];
const DASHA_YEARS = { Ketu: 7, Shukra: 20, Surya: 6, Chandra: 10, Mangal: 7, Rahu: 18, Guru: 16, Shani: 19, Budh: 17 };
const DAYS_PER_YEAR = 365.2425; // Gregorian mean year, used for dasha-length arithmetic

/**
 * Classical Parashari Ashtakavarga (Bhinnashtakavarga) bindu tables.
 * For each target graha, the object lists — for each of the 8 contributors
 * (the 7 classical grahas + Lagna) — the house numbers (counted from that
 * contributor's own rashi) in which the contributor grants a benefic point
 * (bindu) to the target graha. A target's total Ashtakavarga score (0–8) is
 * the count of contributors whose current house-count to the target falls in
 * their listed set.
 */
const ASHTAKAVARGA_TABLES = {
  Surya: { Surya: [1, 2, 4, 7, 8, 9, 10, 11], Chandra: [3, 6, 10, 11], Mangal: [1, 2, 4, 7, 8, 9, 10, 11], Budh: [3, 5, 6, 9, 10, 11, 12], Guru: [5, 6, 9, 11], Shukra: [6, 7, 12], Shani: [1, 2, 4, 7, 8, 9, 10, 11], Lagna: [3, 4, 6, 10, 11, 12] },
  Chandra: { Surya: [3, 6, 7, 8, 10, 11], Chandra: [1, 3, 6, 7, 10, 11], Mangal: [2, 3, 5, 6, 9, 10, 11], Budh: [1, 3, 4, 5, 7, 8, 10, 11], Guru: [1, 4, 7, 8, 10, 11, 12], Shukra: [3, 4, 5, 7, 9, 10, 11], Shani: [3, 5, 6, 11], Lagna: [3, 6, 10, 11] },
  Mangal: { Surya: [3, 5, 6, 10, 11], Chandra: [3, 6, 11], Mangal: [1, 2, 4, 7, 8, 10, 11], Budh: [3, 5, 6, 11], Guru: [6, 10, 11, 12], Shukra: [6, 8, 11, 12], Shani: [1, 4, 7, 8, 9, 10, 11], Lagna: [1, 3, 6, 10, 11] },
  Budh: { Surya: [5, 6, 9, 11, 12], Chandra: [2, 4, 6, 8, 10, 11], Mangal: [1, 2, 4, 7, 8, 9, 10, 11], Budh: [1, 3, 5, 6, 9, 10, 11, 12], Guru: [6, 8, 11, 12], Shukra: [1, 2, 3, 4, 5, 8, 9, 11], Shani: [1, 2, 4, 7, 8, 9, 10, 11], Lagna: [1, 2, 4, 6, 8, 10, 11] },
  Guru: { Surya: [1, 2, 3, 4, 7, 8, 9, 10, 11], Chandra: [2, 5, 7, 9, 11], Mangal: [1, 2, 4, 7, 8, 10, 11], Budh: [1, 2, 4, 5, 6, 9, 10, 11], Guru: [1, 2, 3, 4, 7, 8, 10, 11], Shukra: [2, 5, 6, 9, 10, 11], Shani: [3, 5, 6, 12], Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11] },
  Shukra: { Surya: [8, 11, 12], Chandra: [1, 2, 3, 4, 5, 8, 9, 11, 12], Mangal: [3, 4, 6, 9, 11, 12], Budh: [3, 5, 6, 9, 11], Guru: [5, 8, 9, 10, 11], Shukra: [1, 2, 3, 4, 5, 8, 9, 10, 11], Shani: [3, 4, 5, 8, 9, 10, 11], Lagna: [1, 2, 3, 4, 5, 8, 9, 11] },
  Shani: { Surya: [1, 2, 4, 7, 8, 10, 11], Chandra: [3, 6, 11], Mangal: [3, 5, 6, 10, 11, 12], Budh: [6, 8, 9, 10, 11, 12], Guru: [5, 6, 11, 12], Shukra: [6, 11, 12], Shani: [3, 5, 6, 11], Lagna: [1, 3, 4, 6, 10, 11] },
};

// ── Angle helpers (all wrap-around math lives here) ─────────────────────────

/** Normalize an angle in degrees to the [0, 360) range. */
function normalizeDeg(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Signed shortest angular difference (a - b), normalized to (-180, 180]. */
function signedDiffDeg(a, b) {
  let d = (a - b) % 360;
  if (d <= -180) d += 360;
  if (d > 180) d -= 360;
  return d;
}

/** Shortest angular distance between two longitudes, in [0, 180]. */
function angularDistance(a, b) {
  const diff = Math.abs(normalizeDeg(a) - normalizeDeg(b)) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }
function sinDeg(deg) { return Math.sin(toRad(deg)); }
function cosDeg(deg) { return Math.cos(toRad(deg)); }

// ── 1. Julian Day conversion ─────────────────────────────────────────────────

/**
 * Standard astronomical Julian Day Number, with the Gregorian calendar
 * correction, for a given calendar date and fractional UT hour.
 * (Meeus, "Astronomical Algorithms", ch. 7.)
 *
 * @param {number} year
 * @param {number} month  - 1-12
 * @param {number} day    - 1-31
 * @param {number} utHour - fractional hours of Universal Time (may be <0 or >24; the
 *                          arithmetic below is continuous so this rolls over correctly)
 * @returns {number} Julian Day
 */
function julianDay(year, month, day, utHour) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4); // Gregorian calendar correction
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5 +
    utHour / 24
  );
}

// ── 2. Ayanamsha — Lahiri (refined) ─────────────────────────────────────────

const AYANAMSHA_2000 = 23.85358; // Lahiri ayanamsha at J2000.0, degrees
const AYANAMSHA_RATE_ARCSEC = 50.27972; // precession rate, arcseconds/year

/**
 * Lahiri ayanamsha at a given Julian Day, including the quadratic secular
 * term so precession rate itself drifts slowly over centuries.
 * @param {number} jd
 * @returns {number} ayanamsha in degrees
 */
function ayanamsha(jd) {
  const T = (jd - J2000) / 36525; // Julian centuries from J2000
  const years = T * 100; // Julian years from J2000
  return AYANAMSHA_2000 + (AYANAMSHA_RATE_ARCSEC / 3600) * years + 0.000111 * T * T;
}

// ── 3. Planetary positions — simplified VSOP87 with named corrections ──────

/**
 * Equation of center: the classical truncated series expansion for (true
 * anomaly - mean anomaly) as a function of mean anomaly M and eccentricity e.
 * `terms` selects how many harmonics to include (3 = Sun/Venus/Mars/Jupiter/
 * Saturn's base term per spec, 5 = Mercury's extra precision).
 * @param {number} mDeg - mean anomaly, degrees
 * @param {number} e - orbital eccentricity
 * @param {number} terms - 3 or 5
 * @returns {number} correction in degrees
 */
function equationOfCenter(mDeg, e, terms) {
  const M = toRad(mDeg);
  const e2 = e * e;
  const e3 = e2 * e;
  let c = (2 * e - e3 / 4) * Math.sin(M) + (5 / 4) * e2 * Math.sin(2 * M) + (13 / 12) * e3 * Math.sin(3 * M);
  if (terms >= 5) {
    const e4 = e3 * e;
    const e5 = e4 * e;
    c += (103 / 96) * e4 * Math.sin(4 * M) + (1097 / 960) * e5 * Math.sin(5 * M);
  }
  return toDeg(c);
}

/**
 * Compute the tropical (non-ayanamsha-corrected) geocentric ecliptic
 * longitude of all 9 grahas at a given Julian Day, using mean orbital
 * elements (linear-in-time, epoch J2000) plus the specific correction terms
 * requested for each body. Pure function of `jd` — reused for the natal
 * chart, retrograde sampling (jd±1), and live transits.
 *
 * @param {number} jd
 * @returns {Object<string, number>} tropical longitude (degrees) per graha
 */
function computeTropicalLongitudes(jd) {
  const d = jd - J2000; // days since J2000.0 — the time base for every mean-motion rate below

  // Sun — full 3-term equation of center.
  const M_sun = normalizeDeg(356.047 + 0.9856002585 * d);
  const e_sun = 0.016709 - 1.151e-9 * d;
  const w_sun = 282.9404 + 4.70935e-5 * d;
  const L_sun = normalizeDeg(w_sun + M_sun);
  const Surya = normalizeDeg(L_sun + equationOfCenter(M_sun, e_sun, 3));

  // Mercury — 5-term equation of center + phase correction relative to the Sun.
  const N_me = 48.3313 + 3.24587e-5 * d;
  const w_me = 29.1241 + 1.01444e-5 * d;
  const e_me = 0.205635 + 5.59e-10 * d;
  const M_me = normalizeDeg(168.6562 + 4.0923344368 * d);
  const L_me = normalizeDeg(N_me + w_me + M_me);
  const merBase = normalizeDeg(L_me + equationOfCenter(M_me, e_me, 5));
  const ph_me = normalizeDeg(M_me - M_sun);
  const Budh = normalizeDeg(merBase + 0.1786 * sinDeg(ph_me) - 0.0515 * sinDeg(2 * ph_me));

  // Venus — 3-term equation of center + elongation correction relative to the Sun.
  const N_ve = 76.6799 + 2.4659e-5 * d;
  const w_ve = 54.891 + 1.38374e-5 * d;
  const e_ve = 0.006773 - 1.302e-9 * d;
  const M_ve = normalizeDeg(48.0052 + 1.6021302244 * d);
  const L_ve = normalizeDeg(N_ve + w_ve + M_ve);
  const venBase = normalizeDeg(L_ve + equationOfCenter(M_ve, e_ve, 3));
  const ph_ve = normalizeDeg(M_ve - M_sun);
  const Shukra = normalizeDeg(venBase - 0.039 * sinDeg(ph_ve));

  // Mars — 3-term equation of center.
  const N_ma = 49.5574 + 2.11081e-5 * d;
  const w_ma = 286.5016 + 2.92961e-5 * d;
  const e_ma = 0.093405 + 2.516e-9 * d;
  const M_ma = normalizeDeg(18.6021 + 0.5240207766 * d);
  const L_ma = normalizeDeg(N_ma + w_ma + M_ma);
  const Mangal = normalizeDeg(L_ma + equationOfCenter(M_ma, e_ma, 3));

  // Jupiter — 3-term equation of center.
  const N_ju = 100.4542 + 2.76854e-5 * d;
  const w_ju = 273.8777 + 1.64505e-5 * d;
  const e_ju = 0.048498 + 4.469e-9 * d;
  const M_ju = normalizeDeg(19.895 + 0.0830853001 * d);
  const L_ju = normalizeDeg(N_ju + w_ju + M_ju);
  const Guru = normalizeDeg(L_ju + equationOfCenter(M_ju, e_ju, 3));

  // Saturn — 3-term equation of center + Jupiter-Saturn mutual perturbation.
  const N_sa = 113.6634 + 2.3898e-5 * d;
  const w_sa = 339.3939 + 2.97661e-5 * d;
  const e_sa = 0.055546 - 9.499e-9 * d;
  const M_sa = normalizeDeg(316.967 + 0.0334442282 * d);
  const L_sa = normalizeDeg(N_sa + w_sa + M_sa);
  const satBase = normalizeDeg(L_sa + equationOfCenter(M_sa, e_sa, 3));
  const satPert = 0.872 * sinDeg(M_ju - M_sa) - 0.2267 * sinDeg(M_ju + M_sa);
  const Shani = normalizeDeg(satBase + satPert);

  // Moon — ELP2000-simplified: mean longitude + 12 periodic correction terms
  // (evection, variation, yearly/parallactic equations, ...) including the
  // A1/A2 additive terms for Venus/Jupiter perturbation of the lunar orbit.
  const N_mo = normalizeDeg(125.1228 - 0.0529538083 * d); // mean ascending node (regresses)
  const w_mo = 318.0634 + 0.1643573223 * d;
  const M_mo = normalizeDeg(115.3654 + 13.0649929509 * d);
  const L_mo = normalizeDeg(N_mo + w_mo + M_mo);
  const D = normalizeDeg(L_mo - Surya); // mean elongation of Moon from Sun
  const F = normalizeDeg(L_mo - N_mo); // argument of latitude
  const A1 = normalizeDeg(119.75 + 131.849 * d); // Venus perturbation phase
  const A2 = normalizeDeg(53.09 + 479264.29 * d); // Jupiter perturbation phase
  const moonCorr =
    -1.274 * sinDeg(M_mo - 2 * D) +
    0.658 * sinDeg(2 * D) +
    -0.186 * sinDeg(M_sun) +
    -0.059 * sinDeg(2 * M_mo - 2 * D) +
    -0.057 * sinDeg(M_mo - 2 * D + M_sun) +
    0.053 * sinDeg(M_mo + 2 * D) +
    0.046 * sinDeg(2 * D - M_sun) +
    0.041 * sinDeg(M_mo - M_sun) +
    -0.035 * sinDeg(D) +
    -0.031 * sinDeg(M_mo + M_sun) +
    0.003958 * sinDeg(A1) +
    0.000318 * sinDeg(A2);
  const Chandra = normalizeDeg(L_mo + moonCorr);

  // Rahu/Ketu — TRUE node: mean node + 5-term periodic correction (Meeus ch. 47).
  const nodeCorr =
    -1.4979 * sinDeg(2 * D - 2 * F) +
    -0.15 * sinDeg(M_mo) +
    -0.1226 * sinDeg(2 * D) +
    0.1176 * sinDeg(2 * F) +
    -0.0801 * sinDeg(M_mo + 2 * F);
  const Rahu = normalizeDeg(N_mo + nodeCorr);
  const Ketu = normalizeDeg(Rahu + 180);

  return { Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, Ketu };
}

// ── 4. Lagna (Ascendant) ─────────────────────────────────────────────────────

/**
 * Tropical ascendant degree using precise GMST (IAU-1982-derived formula),
 * nutation-corrected obliquity, and the standard spherical-trigonometry
 * ascendant formula.
 * @param {number} jd
 * @param {number} lat - birthplace latitude, degrees (+N)
 * @param {number} lng - birthplace longitude, degrees (+E)
 * @returns {number} tropical ascendant, degrees [0,360)
 */
function tropicalAscendant(jd, lat, lng) {
  const T = (jd - J2000) / 36525;

  // GMST (Meeus 12.4, derived from the IAU 1982 GMST formula) directly from JD.
  const gmstDeg = normalizeDeg(
    280.46061837 + 360.98564736629 * (jd - J2000) + 0.000387933 * T * T - (T * T * T) / 38710000
  );
  const ramc = normalizeDeg(gmstDeg + lng); // Right Ascension of the Meridian (Local Sidereal Time in degrees)

  // Mean obliquity of the ecliptic, plus a short-period nutation correction.
  const eps0 = 23.439291111 - 0.0130041667 * T - 0.00000016389 * T * T + 0.000000504 * T * T * T;
  const omega = normalizeDeg(125.04 - 1934.136 * T);
  const eps = eps0 + 0.00256 * cosDeg(omega);

  const ascRad = Math.atan2(
    -cosDeg(ramc),
    sinDeg(eps) * Math.tan(toRad(lat)) + cosDeg(eps) * sinDeg(ramc)
  );
  return normalizeDeg(toDeg(ascRad));
}

// ── 8. Navamsa (D9) ──────────────────────────────────────────────────────────

/**
 * Navamsa (D9) rashi for a sidereal longitude: each 30° rashi is split into
 * 9 parts of 3°20', and the starting navamsa rashi cycles by the element
 * (Fire/Earth/Air/Water) of the birth rashi.
 * @param {number} sidDeg - sidereal longitude, degrees
 */
function navamsaInfo(sidDeg) {
  const deg = normalizeDeg(sidDeg);
  const rashiIdx = Math.floor(deg / 30);
  const posInRashi = deg - rashiIdx * 30;
  const navamsaNum = Math.floor(posInRashi / (10 / 3)); // 3.333...deg per navamsa
  const element = RASHI_ELEMENTS[rashiIdx];
  const start = ELEMENT_NAVAMSA_START[element];
  const idx = (start + navamsaNum) % 12;
  return { idx, name: RASHI_NAMES[idx] };
}

/**
 * Nakshatra + pada for a sidereal longitude (27 nakshatras of 13°20' each,
 * 4 padas of 3°20' each).
 */
function nakshatraInfo(sidDeg) {
  const span = 360 / 27;
  const deg = normalizeDeg(sidDeg);
  const idx = Math.floor(deg / span);
  const posInNak = deg - idx * span;
  const pada = Math.floor(posInNak / (span / 4)) + 1;
  return { idx, name: NAKSHATRA_NAMES[idx], pada };
}

// ── 16. Planetary strength/status ───────────────────────────────────────────

/** Uccha / Neecha / Swagrahi / Neutral / Shadow-planet classification. */
function planetStatus(graha, rashiIdx) {
  if (graha === 'Rahu' || graha === 'Ketu') return 'Shadow planet';
  if (EXALTATION[graha] === rashiIdx) return 'Uccha (Exalted)';
  if (DEBILITATION[graha] === rashiIdx) return 'Neecha (Debilitated)';
  if (OWN_SIGN[graha] && OWN_SIGN[graha].includes(rashiIdx)) return 'Swagrahi (Own sign)';
  return 'Neutral';
}

/**
 * Houses (1–12, absolute from Lagna) a graha aspects, applying the Vedic
 * special-aspect rules (Mars/Jupiter/Saturn each see extra houses beyond the
 * universal 7th-house aspect).
 */
function computeAspects(graha, houseFromLagna) {
  const offsets = ASPECT_OFFSETS[graha] || [6];
  return offsets.map((off) => (((houseFromLagna - 1 + off) % 12) + 12) % 12 + 1).sort((a, b) => a - b);
}

// ── 11. Ashtakavarga ─────────────────────────────────────────────────────────

/**
 * Bhinnashtakavarga score (0-8) for each of the 7 classical grahas, using the
 * full Parashari bindu tables and the natal rashi positions of all 8 sources
 * (7 grahas + Lagna).
 */
function computeAshtakavarga(rashiIdxByGraha, lagnaRashiIdx) {
  const contributors = { ...rashiIdxByGraha, Lagna: lagnaRashiIdx };
  const scores = {};
  for (const target of BODY_GRAHAS) {
    const table = ASHTAKAVARGA_TABLES[target];
    const targetRashi = rashiIdxByGraha[target];
    let score = 0;
    for (const contributor of Object.keys(table)) {
      const contribRashi = contributors[contributor];
      if (contribRashi == null) continue;
      const houseCount = ((targetRashi - contribRashi + 12) % 12) + 1;
      if (table[contributor].includes(houseCount)) score++;
    }
    scores[target] = score;
  }
  return scores;
}

// ── 12. Retrograde detection ─────────────────────────────────────────────────

/**
 * A graha is retrograde if its ecliptic longitude one day later is behind
 * its longitude one day earlier (accounting for 0/360 wrap). Rahu/Ketu are
 * always retrograde by nature (the lunar nodes regress).
 */
function isRetrograde(graha, jd) {
  if (graha === 'Rahu' || graha === 'Ketu') return true;
  const before = computeTropicalLongitudes(jd - 1)[graha];
  const after = computeTropicalLongitudes(jd + 1)[graha];
  return signedDiffDeg(after, before) < 0;
}

// ── 9/10. Vimshottari Dasha & Antardasha ────────────────────────────────────

/**
 * Full 9-entry Vimshottari Mahadasha sequence starting at birth: the birth
 * nakshatra's lord runs for the balance of its period (based on how far the
 * Moon has already travelled through that nakshatra), followed by the
 * remaining 8 lords in the standard cyclic order, each for their full length.
 * @param {number} moonSidDeg - Moon's sidereal longitude at birth
 * @param {Date} birthDateUTC - the birth instant (UTC)
 */
function computeDashas(moonSidDeg, birthDateUTC) {
  const nakSpan = 360 / 27;
  const deg = normalizeDeg(moonSidDeg);
  const nakIdx = Math.floor(deg / nakSpan);
  const posInNak = deg - nakIdx * nakSpan;
  const elapsedFraction = posInNak / nakSpan;
  const startLordIdx = nakIdx % 9;

  const dashas = [];
  let cursorMs = birthDateUTC.getTime();
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startLordIdx + i) % 9];
    const fullYears = DASHA_YEARS[lord];
    const years = i === 0 ? fullYears * (1 - elapsedFraction) : fullYears;
    const startMs = cursorMs;
    const endMs = startMs + years * DAYS_PER_YEAR * 24 * 3600 * 1000;
    dashas.push({ lord, start: new Date(startMs), end: new Date(endMs), years });
    cursorMs = endMs;
  }
  return dashas;
}

/**
 * The 9 Antardashas (sub-periods) within a given Mahadasha. The sequence
 * starts with the Mahadasha's own lord, then cycles through the standard
 * 9-lord order. Each Antardasha's share of the Mahadasha is proportional to
 * its lord's years out of the full 120-year Vimshottari cycle (the classical
 * formula) — dividing by the mahadasha lord's own years instead would not
 * sum back to the mahadasha's actual duration, so the cycle total (120) is
 * the correct denominator.
 */
function computeAntardashas(mahaDasha) {
  const TOTAL_DASHA_YEARS = 120; // sum of all 9 Vimshottari periods (7+20+6+10+7+18+16+19+17)
  const mahaLordIdx = DASHA_ORDER.indexOf(mahaDasha.lord);
  const totalMs = mahaDasha.end.getTime() - mahaDasha.start.getTime();

  const antardashas = [];
  let cursorMs = mahaDasha.start.getTime();
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(mahaLordIdx + i) % 9];
    const antarMs = (DASHA_YEARS[lord] / TOTAL_DASHA_YEARS) * totalMs;
    const startMs = cursorMs;
    const endMs = startMs + antarMs;
    antardashas.push({ lord, start: new Date(startMs), end: new Date(endMs) });
    cursorMs = endMs;
  }
  return antardashas;
}

/** Find the entry whose [start, end) window contains `date`, else the last entry. */
function findCurrentPeriod(periods, date) {
  const found = periods.find((p) => date >= p.start && date < p.end);
  return found || periods[periods.length - 1];
}

// ── 15. Yoga & Dosha detection ───────────────────────────────────────────────

/**
 * Detects the requested set of classical yogas/doshas from the natal chart.
 * Sade Sati and its warning text are computed separately from transits (see
 * buildTransits/buildSignificantTransits) since they require today's Saturn.
 */
function computeYogas(planets) {
  const yogas = [];
  const warnings = [];
  const rashiOf = (g) => planets[g].rashiIdx;
  const houseOf = (g) => planets[g].house;

  // Gajakesari Yoga: Jupiter in a kendra (1,4,7,10) counted from the Moon.
  const guruHouseFromMoon = ((rashiOf('Guru') - rashiOf('Chandra') + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(guruHouseFromMoon)) yogas.push('Gajakesari Yoga');

  // Budhaditya Yoga: Sun and Mercury share a rashi.
  if (rashiOf('Surya') === rashiOf('Budh')) yogas.push('Budhaditya Yoga');

  // Chandra-Mangal Yoga: Moon and Mars conjunct.
  if (rashiOf('Chandra') === rashiOf('Mangal')) yogas.push('Chandra-Mangal Yoga');

  // Raj Yoga / Dhana Yoga: an exalted or own-sign graha in a kendra, or in the 2nd/11th.
  for (const g of BODY_GRAHAS) {
    const strong = planets[g].status === 'Uccha (Exalted)' || planets[g].status === 'Swagrahi (Own sign)';
    if (!strong) continue;
    if ([1, 4, 7, 10].includes(houseOf(g))) yogas.push(`Raj Yoga (${g} strong in a kendra)`);
    if ([2, 11].includes(houseOf(g))) yogas.push(`Dhana Yoga (${g} strong in wealth house)`);
  }

  // Neecha Bhanga Raj Yoga: a debilitated graha whose dispositor sits in a kendra.
  for (const g of BODY_GRAHAS) {
    if (planets[g].status !== 'Neecha (Debilitated)') continue;
    const dispositor = RASHI_LORDS[rashiOf(g)];
    if (planets[dispositor] && [1, 4, 7, 10].includes(planets[dispositor].house)) {
      yogas.push(`Neecha Bhanga Raj Yoga (${g})`);
    }
  }

  // Guru-Chandala Yoga: Rahu conjunct Jupiter.
  if (rashiOf('Rahu') === rashiOf('Guru')) yogas.push('Guru-Chandala Yoga');

  // Mangal Dosha (Kuja Dosha): Mars in 1,2,4,7,8,12 from Lagna; cancelled if
  // Mars is exalted, or Jupiter's aspect reaches the 7th house.
  let isManglik = false;
  if ([1, 2, 4, 7, 8, 12].includes(houseOf('Mangal'))) {
    isManglik = true;
    const marsExalted = planets.Mangal.status === 'Uccha (Exalted)';
    const jupiterAspects7th = planets.Guru.aspects.includes(7);
    if (marsExalted || jupiterAspects7th) {
      warnings.push('Mangal Dosha (Kuja Dosha) is present but cancelled — Mars is exalted or aspected by Jupiter on the 7th house.');
    } else {
      warnings.push(`Mangal Dosha (Kuja Dosha) is present — Mars occupies house ${houseOf('Mangal')} from Lagna.`);
    }
  }

  // Kala Sarpa Yoga: all 7 body grahas fall within one arc of the Rahu-Ketu axis.
  const rahuDeg = planets.Rahu.sidDeg;
  const diffs = BODY_GRAHAS.map((g) => normalizeDeg(planets[g].sidDeg - rahuDeg));
  const hasKalaSarpa = diffs.every((x) => x < 180) || diffs.every((x) => x >= 180);
  if (hasKalaSarpa) yogas.push('Kala Sarpa Yoga');

  return { yogas, warnings, isManglik, hasKalaSarpa };
}

// ── 14. Live transit snapshot ────────────────────────────────────────────────

/**
 * Current sidereal positions of all 9 grahas, expressed as houses from the
 * natal Lagna and natal Moon, plus retrograde status and Vedic aspects.
 * @param {number} jdNow
 * @param {number} lagnaRashiIdx - natal Lagna rashi index
 * @param {number} moonRashiIdx - natal Moon rashi index
 */
function buildTransits(jdNow, lagnaRashiIdx, moonRashiIdx) {
  const ayanNow = ayanamsha(jdNow);
  const tropical = computeTropicalLongitudes(jdNow);
  const transits = {};
  for (const g of GRAHA_ORDER) {
    const sidDeg = normalizeDeg(tropical[g] - ayanNow);
    const rashiIdx = Math.floor(sidDeg / 30);
    const houseFromNatal = ((rashiIdx - lagnaRashiIdx + 12) % 12) + 1;
    const houseFromMoon = ((rashiIdx - moonRashiIdx + 12) % 12) + 1;
    transits[g] = {
      sidDeg,
      rashiIdx,
      rashiName: RASHI_NAMES[rashiIdx],
      houseFromNatal,
      houseFromMoon,
      retrograde: isRetrograde(g, jdNow),
      aspects: computeAspects(g, houseFromNatal),
    };
  }
  return transits;
}

/**
 * Narrative flags for the transit snapshot: Sade Sati, Guru Gochar, the
 * Rahu/Ketu axis, and a Mars-in-danger-house warning.
 */
function buildSignificantTransits(transits) {
  const significantTransits = [];

  // Sade Sati: transiting Saturn within 3 signs of natal Moon (houses 12,1,2 from Moon).
  const saturnHouseFromMoon = transits.Shani.houseFromMoon;
  const isSadeSati = [12, 1, 2].includes(saturnHouseFromMoon);
  if (isSadeSati) {
    significantTransits.push({
      planet: 'Shani',
      type: 'warning',
      text: `Transit Saturn is in house ${saturnHouseFromMoon} from your natal Moon — Sade Sati is currently active.`,
    });
  }

  // Guru Gochar: Jupiter's current house from natal Lagna.
  significantTransits.push({
    planet: 'Guru',
    type: 'positive',
    text: `Transit Jupiter (Guru Gochar) is in house ${transits.Guru.houseFromNatal} from your natal Lagna.`,
  });

  // Rahu/Ketu axis: current houses from natal Lagna.
  significantTransits.push({
    planet: 'Rahu',
    type: 'mixed',
    text: `The transit Rahu-Ketu axis falls across houses ${transits.Rahu.houseFromNatal} and ${transits.Ketu.houseFromNatal} from your natal Lagna.`,
  });

  // Mars danger: Mars transiting the 1st, 7th, or 8th house from natal Lagna.
  if ([1, 7, 8].includes(transits.Mangal.houseFromNatal)) {
    significantTransits.push({
      planet: 'Mangal',
      type: 'warning',
      text: `Transit Mars is in house ${transits.Mangal.houseFromNatal} from your natal Lagna — a caution period for accidents/conflict.`,
    });
  }

  return { significantTransits, isSadeSati };
}

// ── Main entry point ─────────────────────────────────────────────────────────

/**
 * Compute a full Kundali (birth chart) for a person.
 *
 * @param {string} dob - date of birth, "YYYY-MM-DD"
 * @param {string} tob - time of birth (local), "HH:MM"
 * @param {number} lat - birthplace latitude, decimal degrees (+N)
 * @param {number} lng - birthplace longitude, decimal degrees (+E)
 * @returns {Object} the full Kundali data structure (see README/spec for shape)
 */
function calculateKundali(dob, tob, lat, lng) {
  const [year, month, day] = dob.split('-').map(Number);
  const [hour, minute] = tob.split(':').map(Number);

  // ── Timezone — derived purely from longitude, never hardcoded. ──
  const utcOffset = lng / 15.0;
  const localHour = hour + minute / 60;
  const utHour = localHour - utcOffset;

  const jd = julianDay(year, month, day, utHour);
  const ayanamshaDeg = ayanamsha(jd);

  // The physical instant of birth in UTC, used as the anchor for dasha timelines.
  const birthDateUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0) - utcOffset * 3600 * 1000);

  // ── Planetary positions: tropical → sidereal ──
  const tropical = computeTropicalLongitudes(jd);
  const sidereal = {};
  const rashiIdxByGraha = {};
  for (const g of GRAHA_ORDER) {
    sidereal[g] = normalizeDeg(tropical[g] - ayanamshaDeg);
    rashiIdxByGraha[g] = Math.floor(sidereal[g] / 30);
  }

  // ── Lagna ──
  const lagnaTropical = tropicalAscendant(jd, lat, lng);
  const lagnaSidDeg = normalizeDeg(lagnaTropical - ayanamshaDeg);
  const lagnaRashiIdx = Math.floor(lagnaSidDeg / 30);
  const lagnaNavamsa = navamsaInfo(lagnaSidDeg);

  // ── Ashtakavarga (natal) ──
  const ashtakavarga = computeAshtakavarga(rashiIdxByGraha, lagnaRashiIdx);

  // ── Per-graha detail (houses, status, navamsa, nakshatra, retro/combust, aspects) ──
  const planets = {};
  for (const g of GRAHA_ORDER) {
    const sidDeg = sidereal[g];
    const rashiIdx = rashiIdxByGraha[g];
    const house = ((rashiIdx - lagnaRashiIdx + 12) % 12) + 1;
    const nak = nakshatraInfo(sidDeg);
    const nav = navamsaInfo(sidDeg);
    const retrograde = isRetrograde(g, jd);

    let combust = false;
    let combustDeg = '0.0';
    if (COMBUST_ORBS[g]) {
      const dist = angularDistance(sidDeg, sidereal.Surya);
      combustDeg = dist.toFixed(1);
      const effectiveOrb = COMBUST_ORBS[g] - (retrograde ? 2 : 0);
      combust = dist <= effectiveOrb;
    }

    planets[g] = {
      sidDeg,
      rashiIdx,
      rashiName: RASHI_NAMES[rashiIdx],
      nakshatra: nak.name,
      pada: nak.pada,
      house,
      status: planetStatus(g, rashiIdx),
      navamsaRashi: nav.name,
      navamsaIdx: nav.idx,
      ashtak: ashtakavarga[g] !== undefined ? ashtakavarga[g] : null,
      retrograde,
      combust,
      combustDeg,
      aspects: computeAspects(g, house),
    };
  }

  // ── Dasha / Antardasha ──
  const dashas = computeDashas(sidereal.Chandra, birthDateUTC);
  const now = new Date();
  const currentDasha = findCurrentPeriod(dashas, now);
  const currentDashaIdx = dashas.indexOf(currentDasha);
  const nextDasha = dashas[currentDashaIdx + 1] || null;

  const antardashas = computeAntardashas(currentDasha);
  const currentAntar = findCurrentPeriod(antardashas, now);

  // ── Yogas & Doshas ──
  const { yogas, warnings, isManglik, hasKalaSarpa } = computeYogas(planets);

  // ── Live transits (today's date) ──
  const nowUTC = new Date();
  const jdNow = julianDay(
    nowUTC.getUTCFullYear(),
    nowUTC.getUTCMonth() + 1,
    nowUTC.getUTCDate(),
    nowUTC.getUTCHours() + nowUTC.getUTCMinutes() / 60 + nowUTC.getUTCSeconds() / 3600
  );
  const transits = buildTransits(jdNow, lagnaRashiIdx, rashiIdxByGraha.Chandra);
  const { significantTransits, isSadeSati } = buildSignificantTransits(transits);
  if (isSadeSati) warnings.push('Sade Sati is currently active (transit Saturn is within 3 signs of your natal Moon).');

  const moonNak = nakshatraInfo(sidereal.Chandra);

  return {
    // Basics
    lagna: RASHI_NAMES[lagnaRashiIdx],
    lagnaIdx: lagnaRashiIdx,
    lagnaSidDeg,
    lagnaNavamsa: lagnaNavamsa.name,

    moonRashi: RASHI_NAMES[rashiIdxByGraha.Chandra],
    moonNak: moonNak.name,
    moonPada: moonNak.pada,
    moonNakIdx: moonNak.idx,

    ayanamsha: ayanamshaDeg.toFixed(4),
    utcOffset: utcOffset.toFixed(2),
    jd,

    planets,

    dashas,
    currentDasha,
    nextDasha,
    antardashas,
    currentAntar,

    yogas,
    warnings,
    isManglik,
    hasKalaSarpa,
    isSadeSati,

    transits,
    significantTransits,
  };
}

module.exports = { calculateKundali };

// ── Simple manual test (uncomment to run: `node src/services/jyotish.js`) ──
// const result = calculateKundali('1993-11-08', '06:30', 23.26, 77.41);
// console.log(JSON.stringify(result, null, 2));
