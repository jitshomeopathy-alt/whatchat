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

const MODEL = 'claude-opus-4-8';

const categoryLabels = {
  addiction: 'De-addiction / Substance Recovery',
  mental: 'Mental / Emotional Wellness',
  sex: 'Sexual Health & Wellness',
};

/**
 * Review the user's questionnaire answers and produce the final result text
 * shown to the user ("we reviewed your illness based on your answers and
 * created your medicines...").
 *
 * Replaces the previous Qdrant similarity search — the question/answer pairs
 * are sent directly to Claude, and Claude's answer is shown to the user.
 *
 * ⚠️ PLACEHOLDER PROMPT — the real system prompt will be provided later.
 * The system prompt is frozen and cached (prompt caching); the per-user
 * question/answer summary is the only volatile part and goes after the cache
 * breakpoint, so repeated calls reuse the cached prefix. Keep it that way when
 * you swap in the real prompt: stable instructions in `SYSTEM_PROMPT`, only the
 * Q&A in the user turn.
 *
 * @param {Object} params
 * @param {string} params.category   - 'addiction' | 'mental' | 'sex'
 * @param {string[]} params.questions - Questions asked, in order
 * @param {string[]} params.answers   - User's answers, aligned with questions
 * @param {Object} [params.user]     - { name, age, gender, raashi, ... } (optional context)
 * @param {string} [params.astrologyResult] - Earlier astrology reading (optional context)
 * @returns {Promise<string>} - Result text to show the user
 */
async function reviewAndPrescribe({ category, questions, answers, user, astrologyResult }) {
  const client = getClient();

  const label = categoryLabels[category] || category;

  const qaPairs = questions
    .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || '(no answer)'}`)
    .join('\n\n');

  // ── Volatile, per-user content (kept AFTER the cached system prefix) ─────────
  const userBlocks = [];
  if (user || astrologyResult) {
    const ctx = [];
    if (user?.name) ctx.push(`Name: ${user.name}`);
    if (user?.age != null) ctx.push(`Age: ${user.age}`);
    if (user?.gender) ctx.push(`Gender: ${user.gender}`);
    if (user?.raashi) ctx.push(`Raashi: ${user.raashi}`);
    if (astrologyResult) ctx.push(`Astrology reading: ${astrologyResult}`);
    if (ctx.length) userBlocks.push(`Context:\n${ctx.join('\n')}`);
  }
  userBlocks.push(`Category: ${label}\n\nQuestionnaire responses:\n\n${qaPairs}`);

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    thinking: { type: 'adaptive' },
    // Frozen system prompt → cached. Any byte change here invalidates the cache,
    // so keep all per-user content in `messages`, never here.
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userBlocks.join('\n\n') }],
  });

  // Log cache effectiveness for tuning (see prompt-caching guidance).
  const u = message.usage || {};
  console.log(
    `[Claude] reviewAndPrescribe usage — input:${u.input_tokens} cache_read:${u.cache_read_input_tokens} cache_write:${u.cache_creation_input_tokens} output:${u.output_tokens}`
  );

  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

// ⚠️ PLACEHOLDER SYSTEM PROMPT — replace with the real prompt when provided.
// Must stay byte-stable across requests for prompt caching to work.
const SYSTEM_PROMPT = `You are a compassionate homeopathic health advisor.
You receive a user's category and their answers to a fixed questionnaire.
Based ONLY on those answers, write a short, warm result the user will read on
WhatsApp. Include:
1. A one-paragraph review of what their answers indicate ("Based on your answers...").
2. The suggested remedies/medicines with a one-line reason each.
3. A reminder that this is informational and not a substitute for a doctor.
Keep it under 250 words. Do not diagnose serious conditions.
[PLACEHOLDER PROMPT — to be replaced.]`;

module.exports = { reviewAndPrescribe };
