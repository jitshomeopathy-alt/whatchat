const Anthropic = require('@anthropic-ai/sdk');

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/** Map a language code to its display name for prompt instructions. */
function languageName(code) {
  return code === 'hi' ? 'Hindi' : 'English';
}

const SYSTEM_PROMPT = `You are an experienced Vedic astrologer (Jyotishi) writing a short WhatsApp message for a client. You are given a person's precisely computed Kundali (birth chart) as JSON — real planetary positions, houses, Vimshottari dasha/antardasha, yogas/doshas and today's transits, produced by an astronomical calculation engine (not guesses).

Write EXACTLY 3-4 bullet points, in this order:
1. One bullet giving a brief, general sense of how astrology (planetary influence, dasha timing) relates to a person's physical/mental wellbeing — a short conceptual bridge, not a lecture.
2. Two to three bullets that connect SPECIFIC evidence from the JSON (a relevant house/planet placement and its status, the current Mahadasha/Antardasha lord, an active yoga/dosha, or a live transit) directly to the person's stated concern — explain plausibly why this concern shows up for them now, grounded in the real data provided.

Rules:
- Each bullet: a short *bold* 2-4 word label, then one warm, specific sentence. Never more than one sentence per bullet.
- Speak TO the person ("you tend to...", "this suggests..."). Be encouraging and specific, never generic filler that could apply to anyone.
- Reference real placements/dasha/yoga names from the JSON in plain language, briefly explaining any jargon (e.g. "your current Shukra-Rahu period").
- Use confident but non-absolute language. No medical, legal, financial, or lifespan predictions. If something looks concerning, gently suggest professional care.
- No preamble, no closing line, no restating the JSON — only the bullets, each starting with "•".
- Write the entire response in the requested output language.`;

/**
 * Produce a short 3-4 point astro read from a precisely computed Kundali
 * (see services/jyotish.js#calculateKundali), explicitly tying the chart to
 * the user's stated concern. Shown right after birth details are collected,
 * before payment, on the WhatsApp "Astro + Clinical" path.
 *
 * @param {Object} params
 * @param {Object} params.kundali - output of calculateKundali()
 * @param {string} [params.name]
 * @param {string} [params.gender]
 * @param {string} [params.concern] - the user's stated concern (free text)
 * @param {string} [params.language] - 'en' | 'hi'
 * @returns {Promise<string>} 3-4 bullet astro read
 */
async function astroBulletReading({ kundali, name, gender, concern, language }) {
  const client = getClient();
  const outputLanguage = languageName(language);

  const userContent = `Person:
- Name: ${name || ''}
- Gender: ${gender || ''}
- Stated concern: ${concern || 'Not specified — give a general wellbeing read instead of a concern-specific one.'}

Kundali JSON:
${JSON.stringify(kundali)}

Write the 3-4 point astro read connecting this chart to the stated concern. Write the entire response in ${outputLanguage}.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 600,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return (textBlock?.text || '').trim();
}

module.exports = { astroBulletReading };
