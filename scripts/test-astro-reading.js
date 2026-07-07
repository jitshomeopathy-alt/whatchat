/**
 * Standalone smoke test for astroClaude.js#astroBulletReading — no Mongo, no
 * WhatsApp, just Kundali calculation + a live Claude call. Useful for
 * iterating on the prompt/intake fields in isolation.
 *
 * Usage: node scripts/test-astro-reading.js
 * Requires ANTHROPIC_API_KEY in .env.
 */
require('dotenv').config();

const { calculateKundali } = require('../src/services/jyotish');
const { astroBulletReading } = require('../src/services/astroClaude');

// Sample birth details — swap for real intake data as needed.
const SAMPLE = {
  dob: '1994-08-21',
  tob: '14:35',
  lat: 28.6139, // New Delhi
  lng: 77.209,
  name: 'Riya',
  gender: 'female',
  concern: 'Career feels stuck no matter what I try',
  realize: 'About 8 months ago, after a promotion I expected didn\'t happen',
  affect: 'My confidence and motivation at work',
  severity: 'Very little control',
  language: 'en',
};

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY in .env — set it before running this script.');
    process.exit(1);
  }

  console.log('Computing Kundali for sample birth details...');
  const kundali = calculateKundali(SAMPLE.dob, SAMPLE.tob, SAMPLE.lat, SAMPLE.lng);

  console.log('Calling Claude for the astro bullet reading...\n');
  const reading = await astroBulletReading({
    kundali,
    name: SAMPLE.name,
    gender: SAMPLE.gender,
    concern: SAMPLE.concern,
    realize: SAMPLE.realize,
    affect: SAMPLE.affect,
    severity: SAMPLE.severity,
    language: SAMPLE.language,
  });

  console.log('--- Reading ---\n');
  console.log(reading);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
