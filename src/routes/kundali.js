const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { calculateKundali } = require('../services/jyotish');

/**
 * POST /api/kundali
 * Body: { dob, tob, lat, lng }
 * Returns the full calculateKundali() output as JSON.
 */
router.post('/kundali', (req, res) => {
  try {
    const { dob, tob, lat, lng } = req.body || {};
    if (!dob || !tob || lat == null || lng == null) {
      return res.status(400).json({ error: 'dob, tob, lat, and lng are all required' });
    }

    const kundali = calculateKundali(dob, tob, Number(lat), Number(lng));
    return res.json(kundali);
  } catch (err) {
    console.error('[Kundali] calculateKundali failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Build the system + user prompt for the AstroVaidhya palm + Jyotish reading.
 * This is a placeholder synthesis prompt — swap in the project's finalized
 * prompt template here when it's ready; the calling shape (kundali JSON +
 * palm image + a short user context block) is what matters for the route.
 */
function buildReadingPrompt({ kundali, name, gender, concern }) {
  const system = `You are an experienced Vedic Jyotishi (astrologer) and palmist for AstroVaidhya. You will be given a person's precomputed Kundali (birth chart) data as JSON, an optional photo of their palm, and their stated concern. Synthesise a warm, specific, and honest reading that:
1. Speaks directly to the person, in a confident but non-absolute tone.
2. Draws on the Lagna, Moon nakshatra, planetary strengths/houses, current Mahadasha/Antardasha, active yogas/doshas, and live transits provided in the JSON.
3. Reads the attached palm photo (if present) for general character/temperament cues only — never as a medical, identity, age, or lifespan claim.
4. Directly addresses the person's stated concern using the chart and palm evidence.
5. Avoids medical, legal, financial, or lifespan predictions. If something concerning appears, suggest consulting the appropriate professional.
Do not restate the raw JSON back to the user — translate it into a natural, readable narrative.`;

  const userText = `Person: ${name || 'the querent'} (${gender || 'unspecified'})
Concern: ${concern || 'General life reading'}

Kundali data (JSON):
${JSON.stringify(kundali)}

Please provide the full Jyotish + palmistry reading now.`;

  return { system, userText };
}

/**
 * POST /api/reading
 * Body: { dob, tob, lat, lng, name, gender, concern, palmImageBase64, palmImageMimeType, anthropicApiKey }
 *
 * Computes the Kundali, builds the reading prompt, calls Claude with the
 * palm image + kundali JSON, and streams the response back to the client as
 * plain text chunks (simplest integration for a WhatsApp/web client that
 * just wants to display the reading as it arrives).
 */
router.post('/reading', async (req, res) => {
  const {
    dob,
    tob,
    lat,
    lng,
    name,
    gender,
    concern,
    palmImageBase64,
    palmImageMimeType,
    anthropicApiKey,
  } = req.body || {};

  if (!dob || !tob || lat == null || lng == null) {
    return res.status(400).json({ error: 'dob, tob, lat, and lng are all required' });
  }

  const apiKey = anthropicApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'No Anthropic API key provided (anthropicApiKey in body, or ANTHROPIC_API_KEY env var)' });
  }

  let kundali;
  try {
    kundali = calculateKundali(dob, tob, Number(lat), Number(lng));
  } catch (err) {
    console.error('[Reading] calculateKundali failed:', err.message);
    return res.status(500).json({ error: err.message });
  }

  const { system, userText } = buildReadingPrompt({ kundali, name, gender, concern });

  const userContent = [];
  if (palmImageBase64 && palmImageMimeType) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: palmImageMimeType, data: palmImageBase64 },
    });
  }
  userContent.push({ type: 'text', text: userText });

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no'); // disable proxy buffering so chunks flush immediately

  try {
    const client = new Anthropic({ apiKey });

    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system,
      messages: [{ role: 'user', content: userContent }],
    });

    stream.on('text', (delta) => {
      res.write(delta);
    });

    stream.on('error', (err) => {
      console.error('[Reading] Anthropic stream error:', err.message);
      if (!res.headersSent) res.status(500);
      res.end(`\n[Error generating reading: ${err.message}]`);
    });

    await stream.finalMessage();
    res.end();
  } catch (err) {
    console.error('[Reading] Anthropic call failed:', err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message });
    }
    return res.end(`\n[Error generating reading: ${err.message}]`);
  }
});

module.exports = router;
