const { sendText, sendButtons, sendList, downloadMedia } = require('../../services/whatsapp');
const { uploadFromUrl } = require('../../services/imagekit');
const razorpay = require('../../services/razorpay');
const email = require('../../services/email');
const { detectCategory } = require('../../services/openai');
const { geocodeBirthPlace } = require('../../services/geocode');
const { calculateKundali } = require('../../services/jyotish');
const { astroBulletReading } = require('../../services/astroClaude');
const { getQuestionPlan } = require('../questions');
const { saveSession, resetSession } = require('../stateManager');
const { formatDob, isValidDob, toIsoDob } = require('../../utils/date');
const {
  t,
  diAreaOptions,
  diSinceOptions,
  diWorseOptions,
  diSleepOptions,
  diEnergyOptions,
  diAppetiteOptions,
  diStressOptions,
} = require('../i18n');
const User = require('../../models/User');
const AnalysisHistory = require('../../models/AnalysisHistory');

/**
 * Entry from the "Consult a doctor" purpose choice: Dr. Jitendra Pal joins the
 * chat, then we go straight to the payment gate (no intake collected).
 * @param {string} whatsappId
 * @param {string} lang
 * @param {Object|null} user
 */
async function startDoctorConsult(whatsappId, lang = 'en', user = null) {
  await saveSession(whatsappId, { language: lang });
  await sendText(whatsappId, t('doctorJoined', lang));
  await requestPayment(whatsappId, lang, user);
}

/**
 * Entry after the intake summary is confirmed: ask whether to continue with the
 * Clinical or Astro + Clinical path.
 * @param {string} whatsappId
 * @param {Object} user   - saved User document
 * @param {Object} buffer - intake answers (name, gender, concern, …)
 */
async function startPathSelect(whatsappId, user, buffer = {}) {
  const lang = user.language || 'en';
  await saveSession(whatsappId, {
    state: 'PATH_SELECT',
    language: lang,
    registrationBuffer: buffer,
  });
  // A small heads-up that there are two ways to proceed before showing them.
  await sendText(whatsappId, t('pathIntro', lang));
  await sendButtons(
    whatsappId,
    t('pathPrompt', lang),
    [
      { id: 'path:clinical', title: t('pathClinical', lang) },
      { id: 'path:astro', title: t('pathAstro', lang) },
    ],
    { header: t('pathHeader', lang) }
  );
}

/**
 * State handler for the post-intake path: PATH_SELECT, the astro detail
 * questions, and the payment gate.
 */
async function handle(whatsappId, message, session) {
  switch (session.state) {
    case 'PATH_SELECT':
      return handlePathSelect(whatsappId, message, session);
    case 'ASTRO_PALM':
      return handlePalm(whatsappId, message, session);
    case 'ASTRO_KUNDLI':
      return handleKundli(whatsappId, message, session);
    case 'ASTRO_DOB':
      return handleDob(whatsappId, message, session);
    case 'ASTRO_BIRTH_TIME':
      return handleBirthTime(whatsappId, message, session);
    case 'ASTRO_BIRTH_PLACE':
      return handleBirthPlace(whatsappId, message, session);
    case 'PAYMENT_PENDING':
      return handlePayment(whatsappId, message, session);
    case 'MEDICAL_Q':
      return handleMedical(whatsappId, message, session);
    case 'DOCTOR_INTAKE':
      return handleDoctorIntake(whatsappId, message, session);
    default:
      return;
  }
}

// ── Path selection ─────────────────────────────────────────────────────────────
async function handlePathSelect(whatsappId, message, session) {
  const lang = session.language || 'en';
  const raw = (interactiveId(message) || extractText(message) || '').toLowerCase().trim();
  let path = null;
  if (raw === 'path:clinical' || raw === 'clinical') path = 'clinical';
  else if (raw === 'path:astro' || raw.includes('astro')) path = 'astro';

  if (!path) {
    await sendButtons(
      whatsappId,
      t('pathRetry', lang),
      [
        { id: 'path:clinical', title: t('pathClinical', lang) },
        { id: 'path:astro', title: t('pathAstro', lang) },
      ],
      { header: t('pathHeader', lang) }
    );
    return;
  }

  const buffer = { ...(session.registrationBuffer || {}), path };

  // A quick thank-you before moving ahead, whichever path they chose.
  await sendText(whatsappId, t('pathThanks', lang));

  // Clinical → record intake, Dr. Jitendra Pal joins, then payment.
  if (path === 'clinical') {
    await saveSession(whatsappId, { registrationBuffer: buffer });
    const user = await User.findOne({ whatsappId });
    await recordIntake(whatsappId, user, buffer);
    await sendText(whatsappId, t('doctorJoined', lang));
    await requestPayment(whatsappId, lang, user);
    return;
  }

  // Astro + Clinical → the astro expert joins up front, then we ask for the
  // Kundli first. If they share it, that's all we need; if not, we fall back to
  // palm photo, DOB and birth time.
  await sendText(whatsappId, t('astroExpertJoined', lang));
  await saveSession(whatsappId, { state: 'ASTRO_KUNDLI', registrationBuffer: buffer });
  await sendText(whatsappId, t('askKundli', lang));
}

// ── Astro details: kundli (optional, never skips the rest) → palm → DOB → birth time → birth place ──
/**
 * The Kundli is purely optional supplementary material for the expert — a
 * shared Kundli or a "skip" both lead on to the palm photo and then the
 * required DOB/birth-time/birth-place steps, since those are what the
 * calculation engine (services/jyotish.js) needs to produce the precise,
 * date/time/location-grounded reading (see sendComputedAstroSummary).
 */
async function handleKundli(whatsappId, message, session) {
  const lang = session.language || 'en';
  const buffer = session.registrationBuffer || {};

  const text = extractText(message)?.toLowerCase().trim();
  if (text === 'skip') {
    await advanceToPalm(whatsappId, lang, { ...buffer, kundliUrl: null });
    return;
  }

  // Kundli may arrive as an image or a PDF document.
  const mediaId = message.type === 'image' ? message.image?.id : message.type === 'document' ? message.document?.id : null;
  if (!mediaId) {
    await sendText(whatsappId, t('kundliSendPrompt', lang));
    return;
  }

  const ext = message.type === 'document' ? 'pdf' : 'jpg';
  const url = await uploadMedia(whatsappId, lang, mediaId, `user_${whatsappId}_kundli.${ext}`);
  if (url === undefined) return;

  await advanceToPalm(whatsappId, lang, { ...buffer, kundliUrl: url });
}

async function advanceToPalm(whatsappId, lang, buffer) {
  await saveSession(whatsappId, { state: 'ASTRO_PALM', registrationBuffer: buffer });
  await sendText(whatsappId, t('askPalm', lang));
}

/**
 * Palm photo is required (not skippable): Claude weaves real palmistry cues
 * into the astro reading (see astroClaude.js), so we need an actual photo.
 */
async function handlePalm(whatsappId, message, session) {
  const lang = session.language || 'en';
  const buffer = session.registrationBuffer || {};

  if (message.type !== 'image') {
    await sendText(whatsappId, t('palmSendPrompt', lang));
    return;
  }

  const url = await uploadMedia(whatsappId, lang, message.image?.id, `user_${whatsappId}_palm.jpg`);
  if (url === undefined) return; // upload failed; user was prompted to retry
  await advanceAfterPalm(whatsappId, lang, { ...buffer, palmUrl: url });
}

async function advanceAfterPalm(whatsappId, lang, buffer) {
  await saveSession(whatsappId, { state: 'ASTRO_DOB', registrationBuffer: buffer });
  await sendText(whatsappId, t('askDob', lang));
}

async function handleDob(whatsappId, message, session) {
  const lang = session.language || 'en';
  const dobInput = extractText(message)?.trim();
  if (!isValidDob(dobInput)) {
    await sendText(whatsappId, t('invalidDob', lang));
    return;
  }

  const buffer = { ...(session.registrationBuffer || {}), dob: formatDob(dobInput) };
  await saveSession(whatsappId, { state: 'ASTRO_BIRTH_TIME', registrationBuffer: buffer });
  await sendText(whatsappId, t('askBirthTime', lang));
}

/**
 * Birth time is now required (not skippable): the calculation engine needs it
 * to compute a real Lagna/houses/dasha timeline, not just a rough guess.
 */
async function handleBirthTime(whatsappId, message, session) {
  const lang = session.language || 'en';
  const raw = extractText(message)?.trim();
  const parsed = raw ? parseBirthTime(raw) : null;

  if (!parsed) {
    await sendText(whatsappId, t('invalidBirthTime', lang));
    return;
  }

  const buffer = { ...(session.registrationBuffer || {}), birthTime: parsed };
  await saveSession(whatsappId, { state: 'ASTRO_BIRTH_PLACE', registrationBuffer: buffer });
  await sendText(whatsappId, t('askBirthPlace', lang));
}

/**
 * Collect the free-text place of birth and resolve it to lat/long, district and
 * state via a free geocoder. Also required (not skippable): the engine needs a
 * real lat/long to compute the ascendant and houses, so a failed lookup asks
 * the user to retry with a more specific place rather than continuing blind.
 */
async function handleBirthPlace(whatsappId, message, session) {
  const lang = session.language || 'en';
  const raw = extractText(message)?.trim();

  if (!raw) {
    await sendText(whatsappId, t('askBirthPlace', lang));
    return;
  }

  let geo = null;
  try {
    geo = await geocodeBirthPlace(raw);
  } catch (err) {
    console.error('[Consult] Geocoding error:', err.message);
  }

  if (!geo) {
    await sendText(whatsappId, t('birthPlaceNotFound', lang));
    return;
  }

  const buffer = {
    ...(session.registrationBuffer || {}),
    birthPlace: raw,
    latitude: geo.latitude,
    longitude: geo.longitude,
    district: geo.district,
    state: geo.state,
  };
  await finalizeAstro(whatsappId, lang, buffer);
}

/**
 * Persist the astro details on the user, record the intake, then the expert
 * joins and we move to payment. Reached either straight after a shared Kundli
 * or after the palm → DOB → birth-time fallback.
 */
async function finalizeAstro(whatsappId, lang, buffer) {
  await saveSession(whatsappId, { registrationBuffer: buffer });

  let user;
  try {
    user = await User.findOneAndUpdate(
      { whatsappId },
      {
        imageUrl: buffer.palmUrl || null,
        kundliUrl: buffer.kundliUrl || null,
        dob: buffer.dob || null,
        birthTime: buffer.birthTime || null,
        birthPlace: buffer.birthPlace || null,
        latitude: buffer.latitude ?? null,
        longitude: buffer.longitude ?? null,
        district: buffer.district || null,
        state: buffer.state || null,
      },
      { new: true }
    );
  } catch (err) {
    console.error('[Consult] Astro detail save error:', err.message);
    user = await User.findOne({ whatsappId });
  }

  await recordIntake(whatsappId, user, buffer);

  // Share a short 3–4 point astro read before we move to payment. Best-effort.
  // (The astro expert already "joined" up front when the astro path was
  // selected.) DOB, birth time and a geocoded birth place are always
  // collected by this point (see handleBirthPlace), so we always run the
  // real calculation engine rather than guessing from an image.
  await sendComputedAstroSummary(whatsappId, lang, buffer);

  await requestPayment(whatsappId, lang, user);
}

/**
 * Compute the real Kundali (Lagna, planetary positions/houses, dasha, yogas,
 * live transits) from the collected birth details, then have Claude turn it
 * into a short WhatsApp read that explicitly ties the chart to the user's
 * exact date/time/place of birth and their full intake context — their
 * concern, when it became real, what it affects, and their sense of control
 * — not just a one-line concern label. If a palm photo was shared, it's
 * passed through too so Claude can weave in palmistry cues alongside the
 * computed chart. Best-effort: on any error we send a gentle fallback and
 * continue to payment regardless.
 */
async function sendComputedAstroSummary(whatsappId, lang, buffer) {
  try {
    const kundali = calculateKundali(toIsoDob(buffer.dob), buffer.birthTime, buffer.latitude, buffer.longitude);
    const read = await astroBulletReading({
      kundali,
      name: buffer.name,
      gender: buffer.gender,
      dob: buffer.dob,
      birthTime: buffer.birthTime,
      birthPlace: buffer.birthPlace,
      district: buffer.district,
      state: buffer.state,
      palmImageUrl: buffer.palmUrl || null,
      concern: buffer.concern,
      realize: buffer.realize,
      affect: buffer.affect,
      severity: buffer.severity,
      language: lang,
    });
    if (read) {
      await sendText(whatsappId, `${t('astroResultIntro', lang)}\n\n${read}`);
      return;
    }
  } catch (err) {
    console.error('[Consult] Computed astro summary error:', err.message);
  }
  await sendText(whatsappId, t('astroResultError', lang));
}

// ── Payment gate ────────────────────────────────────────────────────────────────
/**
 * Create a Razorpay payment link and ask the user to pay. If Razorpay isn't
 * configured or the call fails we fail open — the user reaches the closing
 * message rather than a dead end.
 */
async function requestPayment(whatsappId, lang, user) {
  if (!razorpay.isConfigured()) {
    console.warn('[Consult] Razorpay not configured — skipping payment gate.');
    return finish(whatsappId, lang);
  }

  let link;
  try {
    link = await razorpay.createPaymentLink({ whatsappId, name: user?.name });
  } catch (err) {
    console.error('[Consult] Payment link creation failed:', err.response?.data || err.message);
    return finish(whatsappId, lang);
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

async function handlePayment(whatsappId, message, session) {
  const lang = session.language || 'en';

  if (session.paymentStatus === 'paid') {
    return completePayment(whatsappId);
  }

  const id = interactiveId(message);
  const text = extractText(message)?.trim().toLowerCase();
  const wantsCheck =
    (id && id === 'pay:check') || text === "i've paid" || text === 'paid' || text === 'i have paid';

  if (!wantsCheck) {
    await sendButtons(
      whatsappId,
      t('paymentNotReceived', lang),
      [{ id: 'pay:check', title: t('paymentPaidButton', lang) }],
      { header: t('paymentHeader', lang) }
    );
    return;
  }

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
 * Confirm a paid session and close out. Safe to call from both the WhatsApp flow
 * and the Razorpay webhook; idempotent.
 * @param {string} whatsappId
 */
async function completePayment(whatsappId) {
  const Session = require('../../models/Session');
  const session = await Session.findOne({ whatsappId });
  if (!session) return;

  // Only valid coming out of the payment step; ignore stale/duplicate triggers.
  if (session.state !== 'PAYMENT_PENDING') return;

  const lang = session.language || 'en';
  const path = session.registrationBuffer?.path || 'doctor';
  await saveSession(whatsappId, { paymentStatus: 'paid' });
  await sendText(whatsappId, t('paymentConfirmed', lang));

  const user = await User.findOne({ whatsappId });
  // Notify the admin by email — best-effort, never blocks the user's flow.
  await notifyAdminOfPayment(whatsappId, user, path).catch((err) =>
    console.error('[Consult] Admin payment email failed:', err.message)
  );

  // Direct "Consult a doctor" path → the fixed clinical questionnaire so Dr. Jit
  // has full context. The Explore paths (astro/clinical) keep the adaptive,
  // concern-driven question set.
  if (path === 'doctor') {
    return startDoctorIntake(whatsappId, lang);
  }

  // Collect a short medical questionnaire, then hand the user off to the expert.
  await startMedicalQuestions(whatsappId, lang, user, path);
}

// ── Post-payment medical questionnaire ───────────────────────────────────────
/**
 * After payment, run the category questionnaire so the expert has clinical
 * context, then shift the user to the expert's WhatsApp number. The category is
 * inferred from the user's stated concern; the adaptive question plan is driven
 * one question at a time in the MEDICAL_Q state.
 */
async function startMedicalQuestions(whatsappId, lang, user, path) {
  const concern = await concernForUser(whatsappId, user);

  let category = 'mental';
  try {
    if (concern) category = await detectCategory(concern);
  } catch (err) {
    console.error('[Consult] Category detection failed:', err.message);
  }

  const gender = user?.gender || null;
  const plan = getQuestionPlan(category, lang, gender, []) || [];
  if (plan.length === 0) {
    // No question set available — skip straight to the handoff.
    return finish(whatsappId, lang, user, path);
  }

  await saveSession(whatsappId, {
    state: 'MEDICAL_Q',
    category,
    gender,
    recoverAnswers: [],
    currentQuestion: 0,
  });

  await sendText(whatsappId, t('medicalIntro', lang));
  await sendMedicalQuestion(whatsappId, lang, plan[0], 1);
}

async function handleMedical(whatsappId, message, session) {
  const lang = session.language || 'en';
  const category = session.category || 'mental';
  const gender = session.gender || null;
  const answers = session.recoverAnswers || [];
  const idx = session.currentQuestion || 0;

  // The plan for the answers gathered so far — used to map the current answer.
  const planSoFar = getQuestionPlan(category, lang, gender, answers) || [];
  const current = planSoFar[idx];

  const raw = extractText(message)?.trim();
  if (!raw || raw.length === 0) {
    await sendText(whatsappId, t('medicalRetry', lang));
    return;
  }

  const stored = mapMedicalAnswer(current, raw);
  const updatedAnswers = [...answers, stored];
  const nextIdx = idx + 1;

  // Recompute with the new answer — routing answers expand the plan.
  const plan = getQuestionPlan(category, lang, gender, updatedAnswers) || [];

  if (nextIdx < plan.length) {
    await saveSession(whatsappId, { recoverAnswers: updatedAnswers, currentQuestion: nextIdx });
    await sendMedicalQuestion(whatsappId, lang, plan[nextIdx], nextIdx + 1);
    return;
  }

  // All questions answered — persist for the expert, then hand off.
  await saveSession(whatsappId, { recoverAnswers: updatedAnswers, currentQuestion: nextIdx });
  const user = await User.findOne({ whatsappId });
  await recordMedical(whatsappId, user, category, plan, updatedAnswers).catch((err) =>
    console.error('[Consult] Medical history save error:', err.message)
  );
  await sendText(whatsappId, t('medicalDone', lang));

  const path = session.registrationBuffer?.path || 'doctor';
  await finish(whatsappId, lang, user, path);
}

/** Render one medical question with its numbered options (if any). */
async function sendMedicalQuestion(whatsappId, lang, question, number) {
  let options = '';
  if (question.options && question.options.length) {
    options =
      '\n\n' +
      question.options.map((o, i) => `${i + 1}. ${o}`).join('\n') +
      t(question.multiSelect ? 'medicalOptionsHintMulti' : 'medicalOptionsHint', lang);
  }
  await sendText(whatsappId, t('medicalQuestion', lang, { n: number, text: question.text, options }));
}

/**
 * Map a user's raw reply to the answer we store. When they reply with option
 * number(s) we store the matching option TEXT (so routing questions resolve
 * correctly); otherwise we store their free text as-is.
 */
function mapMedicalAnswer(question, raw) {
  const opts = question?.options || [];
  if (!opts.length) return raw.slice(0, 1000);

  const pick = (token) => {
    const n = parseInt(token.trim(), 10);
    return Number.isInteger(n) && n >= 1 && n <= opts.length ? opts[n - 1] : null;
  };

  if (question.multiSelect) {
    const chosen = raw.split(/[,\s]+/).map(pick).filter(Boolean);
    if (chosen.length) return chosen.join('; ');
  } else {
    const one = pick(raw);
    if (one) return one;
  }
  return raw.slice(0, 1000);
}

/** Determine the user's stated concern for category detection. */
async function concernForUser(whatsappId, user) {
  const Session = require('../../models/Session');
  const session = await Session.findOne({ whatsappId });
  return session?.registrationBuffer?.concern || user?.concern || '';
}

/** Persist the medical questionnaire answers so the care team has context. */
async function recordMedical(whatsappId, user, category, plan, answers) {
  if (!user) return;
  const qa = plan.map((q, i) => ({ question: q.text, answer: answers[i] || '' }));
  await AnalysisHistory.create({
    userId: user._id,
    whatsappId,
    type: 'recover',
    prompt: `Post-payment medical intake (${category})`,
    qa,
    response: 'Medical questionnaire submitted — awaiting expert follow-up.',
    medicines: [],
  });
}

// ── Direct "Consult a doctor" questionnaire ──────────────────────────────────
/**
 * The fixed clinical questionnaire run after payment on the direct
 * "Consult a doctor" path. Declared as data so the single handler below can
 * drive every step uniformly. `type`:
 *   - 'list'    → tappable list; when `acceptText` is set, typed free text is
 *                 also accepted (used for "since when" / "what makes it worse").
 *   - 'buttons' → up to 3 reply buttons; a tap is required.
 *   - 'text'    → free text; `skippable` steps accept "skip".
 *   - 'upload'  → a photo/PDF; always skippable via "skip".
 * The stored answer is the option's English `value` (for selectables) or the
 * user's text, so the doctor's intake email reads consistently.
 */
function doctorIntakeSteps(lang) {
  return [
    { key: 'area',      label: 'Concern area',    type: 'list',    header: t('diHeaderArea', lang),  prompt: t('diAskArea', lang),      options: diAreaOptions(lang) },
    { key: 'problem',   label: 'Main problem',    type: 'text',                                       prompt: t('diAskProblem', lang) },
    { key: 'since',     label: 'Since when',      type: 'list',    header: t('diHeaderSince', lang), prompt: t('diAskSince', lang),     options: diSinceOptions(lang),  acceptText: true },
    { key: 'worse',     label: 'Makes it worse',  type: 'list',    header: t('diHeaderWorse', lang), prompt: t('diAskWorse', lang),     options: diWorseOptions(lang),  acceptText: true },
    { key: 'better',    label: 'Makes it better', type: 'text',                                       prompt: t('diAskBetter', lang) },
    { key: 'treatment', label: 'Treatment taken', type: 'text',                                       prompt: t('diAskTreatment', lang) },
    { key: 'sleep',     label: 'Sleep',           type: 'buttons',                                    prompt: t('diAskSleep', lang),     options: diSleepOptions(lang) },
    { key: 'energy',    label: 'Energy',          type: 'buttons',                                    prompt: t('diAskEnergy', lang),    options: diEnergyOptions(lang) },
    { key: 'appetite',  label: 'Appetite',        type: 'buttons',                                    prompt: t('diAskAppetite', lang),  options: diAppetiteOptions(lang) },
    { key: 'stress',    label: 'Stress level',    type: 'buttons',                                    prompt: t('diAskStress', lang),    options: diStressOptions(lang) },
    { key: 'reports',   label: 'Medical reports', type: 'upload',  skippable: true,                   prompt: t('diAskReports', lang) },
    { key: 'other',     label: 'Anything else',   type: 'text',    skippable: true,                   prompt: t('diAskOther', lang) },
  ];
}

/** Start the fixed doctor questionnaire (after payment on the direct doctor path). */
async function startDoctorIntake(whatsappId, lang = 'en') {
  await saveSession(whatsappId, { state: 'DOCTOR_INTAKE', recoverAnswers: [], currentQuestion: 0 });
  await sendText(whatsappId, t('diIntro', lang));
  await sendDoctorQuestion(whatsappId, lang, doctorIntakeSteps(lang)[0]);
}

/** Render one questionnaire step (list, buttons, or plain text prompt). */
async function sendDoctorQuestion(whatsappId, lang, step) {
  if (step.type === 'list') {
    await sendList(
      whatsappId,
      step.prompt,
      t('diChoose', lang),
      step.options.map((o) => ({ id: o.id, title: o.title })),
      { header: step.header, sectionTitle: step.header }
    );
    return;
  }
  if (step.type === 'buttons') {
    await sendButtons(whatsappId, step.prompt, step.options.map((o) => ({ id: o.id, title: o.title })));
    return;
  }
  await sendText(whatsappId, step.prompt);
}

/**
 * Drive the fixed doctor questionnaire one step at a time. Captures the answer
 * for the current step, then advances (or, if the reply doesn't fit, re-sends
 * the same question so the user is never stuck without something to respond to
 * — important when they've cleared the chat and lost the previous prompt).
 */
async function handleDoctorIntake(whatsappId, message, session) {
  const lang = session.language || 'en';
  const steps = doctorIntakeSteps(lang);
  const idx = session.currentQuestion || 0;
  const step = steps[idx];
  if (!step) return; // out of range — nothing to do

  const id = interactiveId(message);
  const text = extractText(message)?.trim();
  let answer = null;

  if (step.type === 'buttons' || (step.type === 'list' && !step.acceptText)) {
    // A provided option must be tapped.
    const picked = step.options.find((o) => o.id === id);
    if (!picked) {
      await sendText(whatsappId, t('diPickOption', lang));
      await sendDoctorQuestion(whatsappId, lang, step);
      return;
    }
    answer = picked.value;
  } else if (step.type === 'list' && step.acceptText) {
    // Tap OR type — both are valid here.
    const picked = id ? step.options.find((o) => o.id === id) : null;
    if (picked) answer = picked.value;
    else if (text) answer = text.slice(0, 1000);
    else {
      await sendDoctorQuestion(whatsappId, lang, step);
      return;
    }
  } else if (step.type === 'upload') {
    if (text && text.toLowerCase() === 'skip') {
      answer = '(skipped)';
    } else {
      const mediaId =
        message.type === 'image' ? message.image?.id : message.type === 'document' ? message.document?.id : null;
      if (!mediaId) {
        await sendText(whatsappId, t('diReportsSendOrSkip', lang));
        return;
      }
      const ext = message.type === 'document' ? 'pdf' : 'jpg';
      const url = await uploadMedia(whatsappId, lang, mediaId, `user_${whatsappId}_report.${ext}`);
      if (url === undefined) return; // upload failed; user already prompted to retry
      answer = url;
    }
  } else {
    // Free-text step.
    if (step.skippable && text && text.toLowerCase() === 'skip') {
      answer = '(skipped)';
    } else if (!text || text.length < 2) {
      await sendText(whatsappId, t('diTypeAnswer', lang));
      return;
    } else {
      answer = text.slice(0, 1000);
    }
  }

  const answers = [...(session.recoverAnswers || []), answer];
  const nextIdx = idx + 1;

  if (nextIdx < steps.length) {
    await saveSession(whatsappId, { recoverAnswers: answers, currentQuestion: nextIdx });
    await sendDoctorQuestion(whatsappId, lang, steps[nextIdx]);
    return;
  }

  // All answered — persist for the doctor, thank the user, then hand off.
  await saveSession(whatsappId, { recoverAnswers: answers, currentQuestion: nextIdx });
  const user = await User.findOne({ whatsappId });
  await recordDoctorIntake(whatsappId, user, steps, answers).catch((err) =>
    console.error('[Consult] Doctor intake save error:', err.message)
  );
  await sendText(whatsappId, t('diSubmitted', lang));
  await finish(whatsappId, lang, user, 'doctor');
}

/**
 * Persist the doctor questionnaire. The direct doctor path has no registered
 * User, so the reliable channel to the doctor is email; we also write an
 * AnalysisHistory row when a User record does exist. Best-effort.
 */
async function recordDoctorIntake(whatsappId, user, steps, answers) {
  const qa = steps.map((s, i) => ({ question: s.label, answer: answers[i] || '' }));
  const name = user?.name || 'Unknown';

  const lines = [
    'A user completed the doctor consultation questionnaire.',
    '',
    `Name:     ${name}`,
    `WhatsApp: ${whatsappId}`,
    '',
    ...qa.map((x) => `${x.question}: ${x.answer}`),
    '',
    `Time:     ${new Date().toISOString()}`,
  ];
  await email
    .sendEmail({ subject: `🩺 Doctor consultation intake — ${name}`, text: lines.join('\n') })
    .catch((err) => console.error('[Consult] Doctor intake email failed:', err.message));

  if (user) {
    await AnalysisHistory.create({
      userId: user._id,
      whatsappId,
      type: 'recover',
      prompt: 'Doctor consultation questionnaire',
      qa,
      response: 'Doctor questionnaire submitted — awaiting expert follow-up.',
      medicines: [],
    });
  }
}

/**
 * Close out the paid consultation. If a handoff WhatsApp number is configured we
 * move the user to a dedicated expert number (via a wa.me deep link) and park the
 * session in the terminal SHIFTED state; otherwise we fall back to the in-chat
 * closing message and reset.
 */
async function finish(whatsappId, lang, user = null, path = 'doctor') {
  const handoff = handoffNumber(path);
  if (handoff) {
    const link = handoffLink(handoff, user);
    await sendText(whatsappId, t('consultHandoff', lang, { link }));
    // Terminal state: any later message gets the "chat shifted" auto-reply.
    await saveSession(whatsappId, { state: 'SHIFTED' });
    return;
  }
  await sendText(whatsappId, t('consultClosing', lang));
  await resetSession(whatsappId, false);
}

/**
 * Pick the handoff number for the chosen path. Astro consults can route to a
 * different expert than clinical/doctor ones; both fall back to a shared number.
 * @param {string} path - 'astro' | 'clinical' | 'doctor'
 * @returns {string|null} digits-only WhatsApp number, or null if not configured
 */
function handoffNumber(path) {
  const astro = process.env.HANDOFF_WA_NUMBER_ASTRO;
  const doctor = process.env.HANDOFF_WA_NUMBER_DOCTOR;
  const shared = process.env.HANDOFF_WA_NUMBER;
  const chosen = (path === 'astro' ? astro : doctor) || shared;
  if (!chosen) return null;
  return String(chosen).replace(/[^\d]/g, '');
}

/** Build a wa.me deep link to the handoff number with a friendly prefilled message. */
function handoffLink(number, user) {
  const name = user?.name ? `, this is ${user.name}` : '';
  const prefill = `Hi${name}. I've completed my payment and would like to continue my consultation. 🙏`;
  return `https://wa.me/${number}?text=${encodeURIComponent(prefill)}`;
}

/** Email the admin that a user has paid. Best-effort. */
async function notifyAdminOfPayment(whatsappId, user, path) {
  const pathLabel = path === 'astro' ? 'Astro + Clinical' : 'Doctor / Clinical';
  const name = user?.name || 'Unknown';
  const subject = `💰 New paid consultation — ${name} (${pathLabel})`;
  const lines = [
    'A user has completed payment.',
    '',
    `Name:    ${name}`,
    `WhatsApp: ${whatsappId}`,
    `Path:     ${pathLabel}`,
    user?.dob ? `DOB:      ${user.dob}` : null,
    user?.birthPlace ? `Birth Place: ${user.birthPlace}${user.district || user.state ? ` (${[user.district, user.state].filter(Boolean).join(', ')})` : ''}` : null,
    `Time:     ${new Date().toISOString()}`,
  ].filter(Boolean);
  await email.sendEmail({ subject, text: lines.join('\n') });
}

// ── helpers ─────────────────────────────────────────────────────────────────────

/**
 * Download a WhatsApp media item and push it to ImageKit. Returns the hosted URL,
 * or `undefined` if the upload failed (the caller should return — the user has
 * already been prompted to retry).
 */
async function uploadMedia(whatsappId, lang, mediaId, filename) {
  if (!mediaId) {
    await sendText(whatsappId, t('uploadError', lang, { msg: 'no media id' }));
    return undefined;
  }
  try {
    await sendText(whatsappId, t('uploading', lang));
    const buffer = await downloadMedia(mediaId);
    return await uploadFromUrl(null, filename, buffer);
  } catch (err) {
    console.error('[Consult] Media upload error:', err.message);
    await sendText(whatsappId, t('uploadError', lang, { msg: err.message }));
    return undefined;
  }
}

/** Persist the intake answers to AnalysisHistory so the care team has context. */
async function recordIntake(whatsappId, user, buffer) {
  if (!user) return;
  try {
    const qa = [
      { question: 'Concern', answer: buffer.concern || '' },
      { question: 'When it became real', answer: buffer.realize || '' },
      { question: 'Most affected', answer: buffer.affect || '' },
      { question: 'Sense of control', answer: buffer.severity || '' },
      { question: 'Path', answer: buffer.path || '' },
    ];
    await AnalysisHistory.create({
      userId: user._id,
      whatsappId,
      type: 'recover',
      prompt: qa.map((x) => `${x.question}: ${x.answer}`).join(' | ').slice(0, 1000),
      qa,
      response: 'Intake submitted — awaiting expert follow-up.',
      medicines: [],
    });
  } catch (err) {
    console.error('[Consult] Intake history save error:', err.message);
  }
}

function interactiveId(message) {
  if (message.type === 'interactive') return message.interactive?.id || null;
  return null;
}

function extractText(message) {
  if (message.type === 'text') return message.text?.body || '';
  if (message.type === 'interactive') return message.interactive?.title || '';
  return null;
}

/**
 * Parse and normalise a free-text birth time into 24-hour "HH:MM".
 * Accepts "14:30", "9:05", "9.05", "0930", and 12-hour forms like "2:30 pm".
 */
function parseBirthTime(input) {
  const s = input.toLowerCase().trim();
  const ampm = /(am|pm)/.exec(s)?.[1] || null;
  const cleaned = s.replace(/(am|pm)/g, '').replace(/\./g, ':').trim();

  let hh;
  let mm;
  let m = /^(\d{1,2}):(\d{2})$/.exec(cleaned);
  if (m) {
    hh = parseInt(m[1], 10);
    mm = parseInt(m[2], 10);
  } else if ((m = /^(\d{1,2})$/.exec(cleaned)) && ampm) {
    hh = parseInt(m[1], 10);
    mm = 0;
  } else if ((m = /^(\d{2})(\d{2})$/.exec(cleaned))) {
    hh = parseInt(m[1], 10);
    mm = parseInt(m[2], 10);
  } else {
    return null;
  }

  if (ampm === 'pm' && hh < 12) hh += 12;
  if (ampm === 'am' && hh === 12) hh = 0;

  if (isNaN(hh) || isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

module.exports = { startDoctorConsult, startPathSelect, handle, completePayment };
