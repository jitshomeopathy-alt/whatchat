const { sendText, sendButtons, sendList } = require('../../services/whatsapp');
const { astrologyReading, reviewAndPrescribe, reviewFreeform } = require('../../services/openai');
const razorpay = require('../../services/razorpay');
const { saveSession, resetSession } = require('../stateManager');
const { getQuestions } = require('../questions');
const { t, categoryLabel, encouragement } = require('../i18n');
const User = require('../../models/User');
const AnalysisHistory = require('../../models/AnalysisHistory');

// Satisfaction buckets shown after the astrology reading.
const SATISFACTION_BUCKETS = ['0-25', '25-50', '50-75', '75-100'];

/**
 * Entry point after registration completes (or when a registered user restarts).
 * Generates the astrology reading and asks for a satisfaction rating.
 * @param {string} whatsappId
 * @param {Object} user - User document
 */
async function startAstrology(whatsappId, user) {
  const language = user.language || 'en';
  await sendText(whatsappId, t('readingPalm', language, { name: user.name }));

  let reading;
  try {
    reading = await astrologyReading(
      {
        name: user.name,
        dob: user.dob,
        birthTime: user.birthTime,
        age: user.age,
        gender: user.gender,
        city: user.address,
        language,
      },
      user.imageUrl
    );
  } catch (err) {
    console.error('[Consult] Reading error:', err.message);
    await sendText(whatsappId, t('readingUnavailable', language));
    await saveSession(whatsappId, { state: 'REGISTERED' });
    return;
  }

  await saveSession(whatsappId, {
    state: 'ASTRO_SATISFACTION',
    language,
    astrologyResult: reading,
    satisfaction: null,
    satisfactionNote: null,
  });

  await sendText(whatsappId, t('yourReading', language, { reading }));

  await sendList(
    whatsappId,
    t('satisfactionPrompt', language),
    t('satisfactionButton', language),
    SATISFACTION_BUCKETS.map((b) => ({ id: `sat:${b}`, title: `${b}%` })),
    { header: t('satisfactionHeader', language), sectionTitle: t('satisfactionSection', language) }
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
    case 'ASTRO_FEEDBACK':
      return handleSatisfactionNote(whatsappId, message, session);
    case 'CATEGORY_SELECT':
      return handleCategorySelect(whatsappId, message, session);
    case 'CONSULT_OTHER':
      return handleOtherProblem(whatsappId, message, session);
    case 'CONSULT_Q':
      return handleQuestion(whatsappId, message, session);
    case 'PAYMENT_PENDING':
      return handlePayment(whatsappId, message, session);
    case 'CONSULT_ACTION':
      return handleAction(whatsappId, message, session);
    default:
      return;
  }
}

// ── Step 1: satisfaction rating (record & always continue) ────────────────────
async function handleSatisfaction(whatsappId, message, session) {
  const lang = session.language || 'en';
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
    await sendText(whatsappId, t('satisfactionRetry', lang));
    return;
  }

  // A low rating (0-25) → invite a free-text note so we understand the user
  // better before moving on. Higher ratings go straight to category selection.
  if (bucket === '0-25') {
    await saveSession(whatsappId, { satisfaction: bucket, state: 'ASTRO_FEEDBACK' });
    await sendText(whatsappId, t('satisfactionLowNote', lang));
    return;
  }

  await saveSession(whatsappId, { satisfaction: bucket, state: 'CATEGORY_SELECT' });
  await sendCategoryButtons(whatsappId, lang);
}

// ── Step 1b: free-text note after a low (0-25) rating ─────────────────────────
async function handleSatisfactionNote(whatsappId, message, session) {
  const lang = session.language || 'en';
  const note = extractText(message)?.trim();

  // Capture the note (unless they skip); it's fed into the later AI prescription.
  if (note && note.toLowerCase() !== 'skip') {
    await saveSession(whatsappId, { satisfactionNote: note.slice(0, 1000), state: 'CATEGORY_SELECT' });
    await sendText(whatsappId, t('satisfactionNoteThanks', lang));
  } else {
    await saveSession(whatsappId, { state: 'CATEGORY_SELECT' });
  }

  await sendCategoryButtons(whatsappId, lang);
}

// Rendered as a list (not buttons) because WhatsApp caps reply buttons at 3 and
// we now offer a 4th "Something else" option.
async function sendCategoryButtons(whatsappId, lang = 'en') {
  await sendList(
    whatsappId,
    t('categoryPrompt', lang),
    t('categoryButton', lang),
    [
      { id: 'cat:mental', title: t('categoryMental', lang) },
      { id: 'cat:addiction', title: t('categoryAddiction', lang) },
      { id: 'cat:sex', title: t('categorySex', lang) },
      { id: 'cat:other', title: t('categoryOther', lang) },
    ],
    { header: t('categoryHeader', lang), sectionTitle: t('categorySection', lang) }
  );
}

// ── Step 2: category selection ────────────────────────────────────────────────
async function handleCategorySelect(whatsappId, message, session) {
  const lang = session.language || 'en';
  const id = interactiveId(message);
  let category = null;

  if (id && id.startsWith('cat:')) {
    category = id.slice(4);
  } else {
    const text = extractText(message)?.trim().toLowerCase();
    if (['mental', 'addiction', 'sex', 'other'].includes(text)) category = text;
    else if (text === 'sexual health' || text === 'sexual') category = 'sex';
    else if (text === 'something else' || text === 'other problem') category = 'other';
  }

  // "Other / something else": skip the fixed questionnaire and let the user
  // describe their concern in free text, then run it through GPT.
  if (category === 'other') {
    await saveSession(whatsappId, { state: 'CONSULT_OTHER', category: 'other' });
    await sendText(whatsappId, t('askOtherProblem', lang));
    return;
  }

  const set = category && getQuestions(category, lang);
  if (!set) {
    await sendText(whatsappId, t('categoryRetry', lang));
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
    t('startQuestionnaire', lang, { label: categoryLabel(category, lang), count: set.length })
  );
  await askQuestion(whatsappId, category, 0, lang);
}

// ── Step 2b: free-text "Other" concern ────────────────────────────────────────
/**
 * Handle the free-text problem the user typed after choosing "Something else".
 * Runs it through GPT (reviewFreeform), shows the result, stores history, then
 * rejoins the normal flow at the payment gate — identical to finishConsult.
 */
async function handleOtherProblem(whatsappId, message, session) {
  const lang = session.language || 'en';
  const problem = extractText(message)?.trim();

  // Ignore stray interactive taps / empty messages; ask them to type something.
  if (!problem || problem.length < 3) {
    await sendText(whatsappId, t('otherProblemRetry', lang));
    return;
  }

  await sendText(whatsappId, t('reviewing', lang));

  const user = await User.findOne({ whatsappId });

  let resultMessage;
  let medicines = [];
  try {
    const result = await reviewFreeform({
      problem,
      user: user ? { name: user.name, age: user.age, gender: user.gender } : undefined,
      astrologyResult: session.astrologyResult,
      satisfactionNote: session.satisfactionNote,
      language: lang,
    });
    resultMessage = result.message;
    medicines = result.medicines || [];
  } catch (err) {
    console.error('[Consult] freeform review error:', err.message);
    await sendText(whatsappId, t('reviewUnavailable', lang));
    await resetSession(whatsappId, true);
    return;
  }

  // Store to history so the care team / admin can see the concern + response.
  try {
    if (user) {
      await AnalysisHistory.create({
        userId: user._id,
        whatsappId,
        type: 'recover',
        prompt: problem.slice(0, 1000),
        qa: [{ question: t('otherProblemLabel', lang), answer: problem }],
        response: resultMessage,
        medicines: medicines.map((m) => ({ name: m.name, reason: m.reason })),
      });
    }
  } catch (err) {
    console.error('[Consult] History save error:', err.message);
  }

  let resultText = resultMessage;
  if (medicines.length) {
    const items = medicines
      .map((m) => (m.reason ? `• *${m.name}* — ${m.reason}` : `• *${m.name}*`))
      .join('\n');
    resultText += t('medicinesList', lang, { items });
  }

  await sendText(whatsappId, t('resultIntro', lang, { result: resultText }));

  // Same next step as the questionnaire path: gate Order / Consult behind payment.
  await requestPayment(whatsappId, lang, user);
}

// ── Step 3: questionnaire ─────────────────────────────────────────────────────
/**
 * Decide whether a question can be rendered as a tappable list.
 * WhatsApp lists allow <= 10 single-select rows with titles <= 24 chars.
 */
function canUseList(q) {
  return !q.multiSelect && q.options.length <= 10 && q.options.every((o) => o.length <= 24);
}

async function askQuestion(whatsappId, category, qIndex, lang = 'en') {
  const set = getQuestions(category, lang);
  const q = set[qIndex];
  const total = set.length;
  const header = t('questionHeader', lang, { index: qIndex + 1, total });

  if (canUseList(q)) {
    await sendList(
      whatsappId,
      q.text,
      t('chooseButton', lang),
      q.options.map((o, i) => ({ id: `opt:${i}`, title: o })),
      { header, sectionTitle: t('optionsSection', lang) }
    );
    return;
  }

  // Numbered-text fallback (too many options, long titles, or multi-select).
  const numbered = q.options.map((o, i) => `${i + 1}. ${o}`).join('\n');
  const instruction = q.multiSelect
    ? t('multiSelectInstruction', lang)
    : t('singleSelectInstruction', lang);
  await sendText(whatsappId, `*${header}*\n${q.text}\n\n${numbered}${instruction}`);
}

async function handleQuestion(whatsappId, message, session) {
  const lang = session.language || 'en';
  const category = session.category;
  const qIndex = session.currentQuestion;
  const set = getQuestions(category, lang);
  const q = set[qIndex];

  const answer = parseAnswer(message, q);
  if (answer === null) {
    await sendText(
      whatsappId,
      q.multiSelect ? t('multiSelectRetry', lang) : t('singleSelectRetry', lang)
    );
    return;
  }

  const updatedAnswers = [...(session.recoverAnswers || []), answer];
  const nextQ = qIndex + 1;

  if (nextQ < set.length) {
    await saveSession(whatsappId, { recoverAnswers: updatedAnswers, currentQuestion: nextQ });
    // Human touch: every 2 answers, send a short motivating line before the next
    // question (skipped when the next message would be the final review).
    if (updatedAnswers.length % 2 === 0) {
      await sendText(whatsappId, encouragement(lang, updatedAnswers.length / 2 - 1));
    }
    await askQuestion(whatsappId, category, nextQ, lang);
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
  const lang = session.language || 'en';
  await sendText(whatsappId, t('reviewing', lang));

  const user = await User.findOne({ whatsappId });
  const questionTexts = getQuestions(category, lang).map((q) => q.text);

  let message;
  let medicines = [];
  try {
    const result = await reviewAndPrescribe({
      category,
      questions: questionTexts,
      answers,
      user: user
        ? { name: user.name, age: user.age, gender: user.gender }
        : undefined,
      astrologyResult: session.astrologyResult,
      satisfactionNote: session.satisfactionNote,
      language: lang,
    });
    message = result.message;
    medicines = result.medicines || [];
  } catch (err) {
    console.error('[Consult] review error:', err.message);
    await sendText(whatsappId, t('reviewUnavailable', lang));
    await resetSession(whatsappId, true);
    return;
  }

  // Save to history. The suggested medicines are shown to the user and also
  // stored for the care team / admin view.
  try {
    if (user) {
      await AnalysisHistory.create({
        userId: user._id,
        whatsappId,
        type: 'recover',
        prompt: questionTexts.map((q, i) => `${q}: ${answers[i] || ''}`).join(' | ').slice(0, 1000),
        qa: questionTexts.map((q, i) => ({ question: q, answer: answers[i] || '' })),
        response: message,
        medicines: medicines.map((m) => ({ name: m.name, reason: m.reason })),
      });
    }
  } catch (err) {
    console.error('[Consult] History save error:', err.message);
  }

  let resultText = message;
  if (medicines.length) {
    const items = medicines
      .map((m) => (m.reason ? `• *${m.name}* — ${m.reason}` : `• *${m.name}*`))
      .join('\n');
    resultText += t('medicinesList', lang, { items });
  }

  await sendText(whatsappId, t('resultIntro', lang, { result: resultText }));

  // Gate the Order / Consult choice behind a ₹399 payment.
  await requestPayment(whatsappId, lang, user);
}

/**
 * Create a Razorpay payment link and ask the user to pay before unlocking the
 * Order / Consult choice. If Razorpay isn't configured or the API call fails we
 * fail open — the user still gets their next-step options rather than a dead end.
 */
async function requestPayment(whatsappId, lang, user) {
  if (!razorpay.isConfigured()) {
    console.warn('[Consult] Razorpay not configured — skipping payment gate.');
    await sendActionButtons(whatsappId, lang);
    await saveSession(whatsappId, { state: 'CONSULT_ACTION' });
    return;
  }

  let link;
  try {
    link = await razorpay.createPaymentLink({ whatsappId, name: user?.name });
  } catch (err) {
    console.error('[Consult] Payment link creation failed:', err.response?.data || err.message);
    // Fail open: don't trap the user if billing is down.
    await sendActionButtons(whatsappId, lang);
    await saveSession(whatsappId, { state: 'CONSULT_ACTION' });
    return;
  }

  await saveSession(whatsappId, {
    state: 'PAYMENT_PENDING',
    paymentLinkId: link.id,
    paymentStatus: 'pending',
  });

  await sendButtons(
    whatsappId,
    t('paymentPrompt', lang, { link: link.shortUrl }),
    [{ id: 'pay:check', title: t('paymentPaidButton', lang) }],
    { header: t('paymentHeader', lang) }
  );
}

// ── Step 3b: payment gate ─────────────────────────────────────────────────────
async function handlePayment(whatsappId, message, session) {
  const lang = session.language || 'en';

  // Already confirmed (e.g. webhook fired first) — just move on.
  if (session.paymentStatus === 'paid') {
    return completePayment(whatsappId);
  }

  const id = interactiveId(message);
  const text = extractText(message)?.trim().toLowerCase();
  const wantsCheck =
    (id && id === 'pay:check') || text === "i've paid" || text === 'paid' || text === 'i have paid';

  if (!wantsCheck) {
    // Nudge: re-show the pay button without creating a new link.
    await sendButtons(
      whatsappId,
      t('paymentNotReceived', lang),
      [{ id: 'pay:check', title: t('paymentPaidButton', lang) }],
      { header: t('paymentHeader', lang) }
    );
    return;
  }

  // Verify against Razorpay before unlocking.
  let status;
  try {
    status = await razorpay.getPaymentLinkStatus(session.paymentLinkId);
  } catch (err) {
    console.error('[Consult] Payment status check failed:', err.response?.data || err.message);
    await sendText(whatsappId, t('paymentUnavailable', lang));
    return;
  }

  if (status === 'paid') {
    await saveSession(whatsappId, { paymentStatus: 'paid' });
    return completePayment(whatsappId);
  }

  await sendButtons(
    whatsappId,
    t('paymentNotReceived', lang),
    [{ id: 'pay:check', title: t('paymentPaidButton', lang) }],
    { header: t('paymentHeader', lang) }
  );
}

/**
 * Advance from a confirmed payment to the Order / Consult choice. Safe to call
 * from both the WhatsApp flow and the Razorpay webhook; it is idempotent.
 * @param {string} whatsappId
 */
async function completePayment(whatsappId) {
  const Session = require('../../models/Session');
  const session = await Session.findOne({ whatsappId });
  if (!session) return;

  // Only valid coming out of the payment step; ignore stale/duplicate triggers.
  if (session.state !== 'PAYMENT_PENDING' && session.state !== 'CONSULT_ACTION') return;
  if (session.state === 'CONSULT_ACTION') return; // already advanced

  const lang = session.language || 'en';

  await saveSession(whatsappId, { state: 'CONSULT_ACTION', paymentStatus: 'paid' });
  await sendText(whatsappId, t('paymentConfirmed', lang));
  await sendActionButtons(whatsappId, lang);
}

async function sendActionButtons(whatsappId, lang = 'en') {
  await sendButtons(
    whatsappId,
    t('nextStepPrompt', lang),
    [
      { id: 'act:order', title: t('actionOrder', lang) },
      { id: 'act:consult', title: t('actionConsult', lang) },
    ],
    { header: t('nextStepHeader', lang) }
  );
}

// ── Step 4: final action ──────────────────────────────────────────────────────
async function handleAction(whatsappId, message, session) {
  const lang = session.language || 'en';
  const id = interactiveId(message);
  const text = extractText(message)?.trim().toLowerCase();

  let action = null;
  if (id && id.startsWith('act:')) action = id.slice(4);
  else if (text === 'order online' || text === 'order') action = 'order';
  else if (text === 'consult a doctor' || text === 'consult') action = 'consult';

  if (action === 'order') {
    await sendText(whatsappId, t('orderResponse', lang));
  } else if (action === 'consult') {
    await sendText(whatsappId, t('consultResponse', lang));
  } else {
    await sendText(whatsappId, t('actionRetry', lang));
    return;
  }

  await resetSession(whatsappId, true);
  await sendText(whatsappId, t('thankYou', lang));
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

module.exports = { startAstrology, handle, completePayment };
