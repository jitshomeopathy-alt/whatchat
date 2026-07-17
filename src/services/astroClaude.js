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

const SYSTEM_PROMPT = `You are an experienced Vedic astrologer (Jyotishi) writing a detailed but warm WhatsApp reading for a client, shown right before they pay for their full consultation — it needs to feel substantial and specifically theirs, not a teaser. You are given a person's precisely computed Kundali (birth chart) as JSON — real planetary positions, houses, Vimshottari dasha/antardasha, yogas/doshas and today's transits, produced by an astronomical calculation engine (not guesses) from their exact date, time and place of birth — plus a photo of their palm, plus what the person told us during intake about what they're going through.

Read the intake context closely before writing: their stated concern, when it started feeling real to them, what part of their life it's hitting hardest, and how much control they feel they currently have. Treat this as the person's actual suffering, not a label to paraphrase.

STRUCTURE — write in this exact order:
1. Opening line (no bullet, 1-2 sentences): ground the reading in their exact birth details — date, time, and place of birth — and name their Lagna (ascendant) sign and Moon sign/nakshatra, e.g. "Born on 21 May 1990 at 6:30 AM in Indore, Madhya Pradesh, you carry a Mesha (Aries) Lagna with Moon in Krittika nakshatra." This is what makes the reading feel computed for them specifically, not generic.
2. EXACTLY 6-7 bullet points, covering, in this order:
   a. *Core nature* — one bullet on their essential temperament, drawn from the Lagna lord's placement/status or a standout planet.
   b. *Current life chapter* — one bullet naming their current Mahadasha and Antardasha lords and what kind of life chapter this combination represents in plain language.
   c-e. Three bullets that connect SPECIFIC evidence from the JSON (a relevant house/planet placement and its status, an active yoga/dosha, or a live transit) directly to the person's actual situation — their concern, what it's affecting, since when, and their sense of control over it. Explain plausibly why this is showing up for them now and in this particular way. Don't just repeat their words back — interpret them astrologically.
   f. *Palm cross-check* — one bullet weaving in the palm photo's general character cues (overall hand shape, dominant mounts, the look and flow of the major lines), agreeing with or adding nuance to what the chart shows. Treat it strictly as a character/temperament cue, never as a medical, identity, age, or lifespan claim, and never narrate the image clinically.
   g. *What's ahead* — one closing bullet, forward-looking: the next notable shift (an upcoming Antardasha change, an easing/intensifying transit) and a gentle, practical note on navigating the current period.
3. A closing block titled *AstroVaidhya Personal Constitution Analysis* (write this exact title, bolded, on its own line), followed by EXACTLY these 10 labeled sections, in this order, each as "*N. Section Title*" on its own line followed by 1-2 warm, specific sentences (no further bullets inside):
   1. *Your Core Nature* — their essential temperament. Where it fits, anchor the phrasing around one or two of these trait words rather than inventing unrelated ones: Calm, Emotional, Dominant, Sensitive, Practical, Independent, Spiritual. Ground it in the Lagna/Lagna-lord or the strongest placed planet.
   2. *How Your Mind Works* — their thinking style. Where it fits, anchor around: Logical, Emotional, Overthinker, Fast thinker, Planner, Impulsive. Ground it in Mercury's/Moon's placement and dignity, or a relevant house.
   3. *Hidden Strengths* — a capability or quality they likely underrate in themselves, drawn from a well-placed or exalted planet, a benefic yoga, or a strong mount/line on the palm.
   4. *Biggest Challenges* — a recurring difficulty or blind spot, drawn from a weak/debilitated/afflicted planet, a dosha, or a challenging house placement.
   5. *What Drains Your Energy* — the kind of situations, people, or demands that tend to exhaust them, inferred from a malefic-influenced house/planet.
   6. *What Gives You Energy* — the kind of situations, people, or activities that tend to restore them, inferred from a benefic-influenced house/planet.
   7. *Communication Style* — how they tend to express themselves, drawn from Mercury, the 2nd/3rd house, or the palm's head line.
   8. *Relationship Nature* — how they tend to show up in close relationships, drawn from Venus, the 7th house, or the palm's heart line.
   9. *Life Lesson* — the growth theme this chart points toward, drawn from Saturn's placement, Rahu/Ketu axis, or a karmic house.
   10. *Overall Personality Summary* — 2-3 sentences tying the whole constitution together into one coherent, affirming picture; do not just repeat the previous 9 lines verbatim.

Rules:
- Each of the 6-7 main bullets: a short *bold* 2-4 word label, then up to TWO warm, specific sentences (more depth than a one-liner, but never a paragraph).
- Speak TO the person ("you tend to...", "this suggests..."). Be encouraging and specific, never generic filler that could apply to anyone.
- Reference real placements/dasha/yoga names from the JSON in plain language, briefly explaining any jargon (e.g. "your current Shukra-Rahu period").
- At least one bullet should acknowledge the emotional weight of what they described (how long it's been affecting them, or how little control they feel) before offering the astrological framing — this should read as understood, not analysed from a distance.
- In the constitution analysis block, keep each of the 10 sections to 1-2 sentences — this is a compact trait card, not a repeat of the earlier bullets. Draw on the chart, the palm photo, and the intake context together, but don't force every section to reference the stated concern — some (like Hidden Strengths or Life Lesson) should stand on their own as general constitutional insight.
- Use confident but non-absolute language. No medical, legal, financial, or lifespan predictions. If something looks concerning, gently suggest professional care.
- No extra closing summary line beyond section 10, no restating the JSON — output only: the opening line, then the 6-7 bullets (each starting with "•"), then the "AstroVaidhya Personal Constitution Analysis" block with its 10 numbered sections.
- Write the entire response in the requested output language, including the "AstroVaidhya Personal Constitution Analysis" title and all section titles.`;

/**
 * Produce a detailed astro read — opening line + 6-7 situational bullets,
 * followed by a 10-section "AstroVaidhya Personal Constitution Analysis"
 * (Core Nature, How Your Mind Works, Hidden Strengths, Biggest Challenges,
 * What Drains/Gives Your Energy, Communication Style, Relationship Nature,
 * Life Lesson, Overall Personality Summary) — from a precisely computed
 * Kundali (see services/jyotish.js#calculateKundali), explicitly tying the
 * chart to the person's exact date/time/place of birth and their full
 * intake context — their stated concern, when it became real, what it's
 * affecting, and their sense of control — not just a one-line concern
 * label. The palm photo is sent along as a vision input so Claude can weave
 * palmistry cues in alongside the computed chart. Shown right after birth
 * details are collected, before payment, on the WhatsApp "Astro + Clinical"
 * path — this is the last thing the user sees before the payment gate, so it
 * needs to read as substantial and specifically theirs. The full text
 * (including the constitution section) is later passed back as
 * "Profile reading" context to services/openai.js#reviewAndPrescribe when
 * the illness questionnaire is reviewed.
 *
 * @param {Object} params
 * @param {Object} params.kundali - output of calculateKundali()
 * @param {string} [params.name]
 * @param {string} [params.gender]
 * @param {string} [params.dob] - date of birth, as shown to the user (e.g. "21-05-1990")
 * @param {string} [params.birthTime] - time of birth, "HH:MM"
 * @param {string} [params.birthPlace] - free-text place of birth as entered by the user
 * @param {string} [params.district] - geocoded district/city
 * @param {string} [params.state] - geocoded state
 * @param {string|null} [params.palmImageUrl] - public URL of the user's palm photo, or null
 * @param {string} [params.concern] - the user's stated concern (free text or category)
 * @param {string} [params.realize] - when the concern started feeling real to them (free text)
 * @param {string} [params.affect] - the area of life it affects most (e.g. "My sleep")
 * @param {string} [params.severity] - their stated sense of control (e.g. "Very little control")
 * @param {string} [params.language] - 'en' | 'hi'
 * @returns {Promise<string>} opening line + 6-7 bullet astro read, followed by the
 *   10-section "AstroVaidhya Personal Constitution Analysis" block
 */
async function astroBulletReading({
  kundali,
  name,
  gender,
  dob,
  birthTime,
  birthPlace,
  district,
  state,
  palmImageUrl,
  concern,
  realize,
  affect,
  severity,
  language,
}) {
  const client = getClient();
  const outputLanguage = languageName(language);

  const placeLine = birthPlace
    ? `${birthPlace}${district || state ? ` (${[district, state].filter(Boolean).join(', ')})` : ''}`
    : 'unknown';

  const userText = `Person:
- Name: ${name || ''}
- Gender: ${gender || ''}
- Date of Birth: ${dob || 'unknown'}
- Time of Birth: ${birthTime || 'unknown'}
- Place of Birth: ${placeLine}
- Palm photo attached: ${palmImageUrl ? 'yes' : 'no'}

What they shared with us:
- Concern: ${concern || 'Not specified — give a general wellbeing read instead of a concern-specific one.'}
- When it started feeling real: ${realize || 'not shared'}
- What it affects most: ${affect || 'not shared'}
- Their current sense of control over it: ${severity || 'not shared'}

Kundali JSON:
${JSON.stringify(kundali)}

Write the opening line plus the 6-7 point astro read connecting this chart and their exact birth details to their actual situation above. Write the entire response in ${outputLanguage}.`;

  const userContent = palmImageUrl
    ? [
        { type: 'image', source: { type: 'url', url: palmImageUrl } },
        { type: 'text', text: userText },
      ]
    : userText;

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2000,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return (textBlock?.text || '').trim();
}

module.exports = { astroBulletReading };
