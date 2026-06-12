const { sendText, sendButtons, sendList } = require('../../services/whatsapp');
const { astrologyReading, reviewAndPrescribe } = require('../../services/openai');
const { saveSession, resetSession } = require('../stateManager');
const questions = require('../questions');
const User = require('../../models/User');
const AnalysisHistory = require('../../models/AnalysisHistory');

const categoryLabels = {
  addiction: 'De-addiction / Substance Recovery',
  mental: 'Mental / Emotional Wellness',
  sex: 'Sexual Health & Wellness',
};

// Satisfaction buckets shown after the astrology reading.
const SATISFACTION_BUCKETS = ['0-25', '25-50', '50-75', '75-100'];

/**
 * Entry point after registration completes (or when a registered user restarts).
 * Generates the astrology reading and asks for a satisfaction rating.
 * @param {string} whatsappId
 * @param {Object} user - User document
 */
async function startAstrology(whatsappId, user) {
  await sendText(whatsappId, `🔮 Reading the stars for you, *${user.name}*... please wait a moment.`);

  let reading;
  try {
    reading = await astrologyReading({
      name: user.name,
      dob: user.dob,
      raashi: user.raashi,
      address: user.address,
      age: user.age,
      gender: user.gender,
    });
  } catch (err) {
    console.error('[Consult] Astrology error:', err.message);
    await sendText(
      whatsappId,
      'Sorry, the reading service is temporarily unavailable. Please type *"hi"* to try again in a moment.'
    );
    await saveSession(whatsappId, { state: 'REGISTERED' });
    return;
  }

  await saveSession(whatsappId, { state: 'ASTRO_SATISFACTION', astrologyResult: reading });

  await sendText(whatsappId, `✨ *Your Reading*\n\n${reading}`);

  await sendList(
    whatsappId,
    'How satisfied are you with this reading? Pick the range that fits.',
    'Rate it',
    SATISFACTION_BUCKETS.map((b) => ({ id: `sat:${b}`, title: `${b}%` })),
    { header: 'Your satisfaction', sectionTitle: 'Satisfaction %' }
  );
}

/**
 * Main state handler for the astrology → consult flow.
 * @param {string} whatsappId
 * @param {Object} message
 * @param {Object} session
 */
async function handle(whatsappId, message, session) {
  switch (session.state) {
    case 'ASTRO_SATISFACTION':
      return handleSatisfaction(whatsappId, message, session);
    case 'CATEGORY_SELECT':
      return handleCategorySelect(whatsappId, message, session);
    case 'CONSULT_Q':
      return handleQuestion(whatsappId, message, session);
    case 'CONSULT_ACTION':
      return handleAction(whatsappId, message, session);
    default:
      return;
  }
}

// ── Step 1: satisfaction rating (record & always continue) ────────────────────
async function handleSatisfaction(whatsappId, message, session) {
  const id = interactiveId(message);
  let bucket = null;

  if (id && id.startsWith('sat:')) {
    bucket = id.slice(4);
  } else {
    // Accept a typed bucket too (e.g. "50-75" or "3")
    const text = extractText(message)?.trim();
    bucket = SATISFACTION_BUCKETS.find((b) => text === b || text === `${b}%`) || null;
    const asNum = parseInt(text, 10);
    if (!bucket && asNum >= 1 && asNum <= 4) bucket = SATISFACTION_BUCKETS[asNum - 1];
  }

  if (!bucket) {
    await sendText(whatsappId, 'Please tap one of the satisfaction options to continue.');
    return;
  }

  await saveSession(whatsappId, { satisfaction: bucket, state: 'CATEGORY_SELECT' });
  await sendCategoryButtons(whatsappId);
}

async function sendCategoryButtons(whatsappId) {
  await sendButtons(
    whatsappId,
    'Thanks! Which area would you like to focus on?',
    [
      { id: 'cat:mental', title: 'Mental' },
      { id: 'cat:addiction', title: 'Addiction' },
      { id: 'cat:sex', title: 'Sexual health' },
    ],
    { header: 'Choose your area' }
  );
}

// ── Step 2: category selection ────────────────────────────────────────────────
async function handleCategorySelect(whatsappId, message, session) {
  const id = interactiveId(message);
  let category = null;

  if (id && id.startsWith('cat:')) {
    category = id.slice(4);
  } else {
    const text = extractText(message)?.trim().toLowerCase();
    if (['mental', 'addiction', 'sex'].includes(text)) category = text;
    else if (text === 'sexual health' || text === 'sexual') category = 'sex';
  }

  if (!category || !questions[category]) {
    await sendText(whatsappId, 'Please tap *Mental*, *Addiction*, or *Sexual health* to continue.');
    return;
  }

  await saveSession(whatsappId, {
    state: 'CONSULT_Q',
    category,
    recoverAnswers: [],
    currentQuestion: 0,
  });

  await sendText(
    whatsappId,
    `✅ Starting the *${categoryLabels[category]}* questionnaire — ${questions[category].length} questions.`
  );
  await askQuestion(whatsappId, category, 0);
}

// ── Step 3: questionnaire ─────────────────────────────────────────────────────
/**
 * Decide whether a question can be rendered as a tappable list.
 * WhatsApp lists allow <= 10 single-select rows with titles <= 24 chars.
 */
function canUseList(q) {
  return !q.multiSelect && q.options.length <= 10 && q.options.every((o) => o.length <= 24);
}

async function askQuestion(whatsappId, category, qIndex) {
  const q = questions[category][qIndex];
  const total = questions[category].length;
  const header = `Question ${qIndex + 1} of ${total}`;

  if (canUseList(q)) {
    await sendList(
      whatsappId,
      q.text,
      'Choose',
      q.options.map((o, i) => ({ id: `opt:${i}`, title: o })),
      { header, sectionTitle: 'Options' }
    );
    return;
  }

  // Numbered-text fallback (too many options, long titles, or multi-select).
  const numbered = q.options.map((o, i) => `${i + 1}. ${o}`).join('\n');
  const instruction = q.multiSelect
    ? '\n\n_Reply with the number(s) — for multiple, separate with commas (e.g. 1,3,5)._'
    : '\n\n_Reply with the option number._';
  await sendText(whatsappId, `*${header}*\n${q.text}\n\n${numbered}${instruction}`);
}

async function handleQuestion(whatsappId, message, session) {
  const category = session.category;
  const qIndex = session.currentQuestion;
  const q = questions[category][qIndex];

  const answer = parseAnswer(message, q);
  if (answer === null) {
    await sendText(
      whatsappId,
      q.multiSelect
        ? 'Please reply with the option number(s), separated by commas.'
        : 'Please tap an option or reply with the option number.'
    );
    return;
  }

  const updatedAnswers = [...(session.recoverAnswers || []), answer];
  const nextQ = qIndex + 1;

  if (nextQ < questions[category].length) {
    await saveSession(whatsappId, { recoverAnswers: updatedAnswers, currentQuestion: nextQ });
    await askQuestion(whatsappId, category, nextQ);
    return;
  }

  // All answered → review with OpenAI.
  await saveSession(whatsappId, { recoverAnswers: updatedAnswers, currentQuestion: nextQ });
  await finishConsult(whatsappId, session, category, updatedAnswers);
}

/**
 * Resolve the user's answer (interactive tap or typed number(s)) to option text.
 * Returns the answer string, or null if it couldn't be parsed.
 */
function parseAnswer(message, q) {
  const id = interactiveId(message);
  if (id && id.startsWith('opt:')) {
    const idx = parseInt(id.slice(4), 10);
    if (idx >= 0 && idx < q.options.length) return q.options[idx];
    return null;
  }

  const text = extractText(message)?.trim();
  if (!text) return null;

  // Parse one or more numbers (multi-select allows several).
  const nums = text
    .split(/[\s,]+/)
    .map((t) => parseInt(t, 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= q.options.length);

  if (nums.length === 0) return null;
  if (!q.multiSelect) return q.options[nums[0] - 1];

  const picked = [...new Set(nums)].map((n) => q.options[n - 1]);
  return picked.join(', ');
}

async function finishConsult(whatsappId, session, category, answers) {
  await sendText(whatsappId, '✅ Reviewing your answers and preparing your result... ⏳');

  const user = await User.findOne({ whatsappId });
  const questionTexts = questions[category].map((q) => q.text);

  let resultText;
  try {
    resultText = await reviewAndPrescribe({
      category,
      questions: questionTexts,
      answers,
      user: user
        ? { name: user.name, age: user.age, gender: user.gender, raashi: user.raashi }
        : undefined,
      astrologyResult: session.astrologyResult,
    });
  } catch (err) {
    console.error('[Consult] review error:', err.message);
    await sendText(
      whatsappId,
      'Sorry, the review service is temporarily unavailable. Please type *"hi"* to start again shortly.'
    );
    await resetSession(whatsappId, true);
    return;
  }

  // Save to history.
  try {
    if (user) {
      await AnalysisHistory.create({
        userId: user._id,
        whatsappId,
        type: 'recover',
        prompt: questionTexts.map((q, i) => `${q}: ${answers[i] || ''}`).join(' | ').slice(0, 1000),
        response: resultText,
        medicines: [],
      });
    }
  } catch (err) {
    console.error('[Consult] History save error:', err.message);
  }

  await saveSession(whatsappId, { state: 'CONSULT_ACTION' });

  await sendText(whatsappId, `🩺 *We reviewed your illness based on your answers and prepared your result:*\n\n${resultText}`);

  await sendButtons(
    whatsappId,
    'What would you like to do next?',
    [
      { id: 'act:order', title: 'Order online' },
      { id: 'act:consult', title: 'Consult a doctor' },
    ],
    { header: 'Next step', footer: 'Informational only — not a substitute for a doctor.' }
  );
}

// ── Step 4: final action ──────────────────────────────────────────────────────
async function handleAction(whatsappId, message, session) {
  const id = interactiveId(message);
  const text = extractText(message)?.trim().toLowerCase();

  let action = null;
  if (id && id.startsWith('act:')) action = id.slice(4);
  else if (text === 'order online' || text === 'order') action = 'order';
  else if (text === 'consult a doctor' || text === 'consult') action = 'consult';

  if (action === 'order') {
    await sendText(
      whatsappId,
      '🛒 *Order online*\n\nGreat — our team will help you order the recommended medicines. ' +
        'You will receive a secure ordering link shortly.\n\n_(Ordering integration coming soon.)_'
    );
  } else if (action === 'consult') {
    await sendText(
      whatsappId,
      '👨‍⚕️ *Consult a doctor*\n\nWe will connect you with a qualified doctor for a consultation. ' +
        'You will receive an appointment link shortly.\n\n_(Consultation booking coming soon.)_'
    );
  } else {
    await sendText(whatsappId, 'Please tap *Order online* or *Consult a doctor*.');
    return;
  }

  await resetSession(whatsappId, true);
  await sendText(whatsappId, 'Thank you! 🙏 Type *"hi"* anytime for a fresh reading and consultation.');
}

// ── helpers ───────────────────────────────────────────────────────────────────
function interactiveId(message) {
  if (message.type === 'interactive') return message.interactive?.id || null;
  return null;
}

function extractText(message) {
  if (message.type === 'text') return message.text?.body || '';
  if (message.type === 'interactive') return message.interactive?.title || '';
  return null;
}

module.exports = { startAstrology, handle };
