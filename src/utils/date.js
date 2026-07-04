/**
 * Date helpers. We store and display dates of birth as dd-mm-yyyy everywhere.
 */

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Normalize a free-text date of birth into dd-mm-yyyy.
 * Accepts common inputs like "21 May 1990", "1990-05-21", "21/05/1990",
 * "21-05-1990". Returns the original string if it can't be parsed.
 * @param {string} input
 * @returns {string}
 */
function formatDob(input) {
  if (!input) return input;
  const s = String(input).trim();

  // yyyy-mm-dd or yyyy/mm/dd
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) return `${pad(m[3])}-${pad(m[2])}-${m[1]}`;

  // dd-mm-yyyy or dd/mm/yyyy
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return `${pad(m[1])}-${pad(m[2])}-${m[3]}`;

  // Textual, e.g. "21 May 1990"
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  }

  return s;
}

/**
 * Whether a free-text date of birth looks parseable.
 * @param {string} input
 * @returns {boolean}
 */
function isValidDob(input) {
  if (!input) return false;
  const s = String(input).trim();
  if (/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.test(s)) return true;
  if (/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.test(s)) return true;
  return !isNaN(new Date(s).getTime());
}

/**
 * Convert our stored dd-mm-yyyy DOB into the ISO yyyy-mm-dd form the
 * astronomical calculation engine (services/jyotish.js) requires.
 * @param {string} dmy - "dd-mm-yyyy"
 * @returns {string} "yyyy-mm-dd"
 */
function toIsoDob(dmy) {
  const [d, m, y] = String(dmy).split('-');
  return `${y}-${m}-${d}`;
}

module.exports = { formatDob, isValidDob, toIsoDob };
