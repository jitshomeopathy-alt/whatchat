const { sendText, sendButtons, downloadMedia } = require('../../services/whatsapp');
const { uploadFromUrl } = require('../../services/imagekit');
const razorpay = require('../../services/razorpay');
const email = require('../../services/email');
const { saveSession, resetSession } = require('../stateManager');
const { formatDob, isValidDob } = require('../../utils/date');
const { t } = require('../i18n');
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
    case 'PAYMENT_PENDING':
      return handlePayment(whatsappId, message, session);
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

  // Astro + Clinical → ask for the Kundli first. If they share it, that's all we
  // need; if not, we fall back to palm photo, DOB and birth time.
  await saveSession(whatsappId, { state: 'ASTRO_KUNDLI', registrationBuffer: buffer });
  await sendText(whatsappId, t('askKundli', lang));
}

// ── Astro details: kundli → (if skipped) palm → DOB → birth time ───────────────
async function handleKundli(whatsappId, message, session) {
  const lang = session.language || 'en';
  const buffer = session.registrationBuffer || {};

  const text = extractText(message)?.toLowerCase().trim();
  if (text === 'skip') {
    // No Kundli — collect palm photo, DOB and birth time instead.
    await saveSession(whatsappId, { state: 'ASTRO_PALM', registrationBuffer: { ...buffer, kundliUrl: null } });
    await sendText(whatsappId, t('askPalm', lang));
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

  // Kundli provided — skip palm, DOB and birth time, and finalise directly.
  await finalizeAstro(whatsappId, lang, { ...buffer, kundliUrl: url });
}

async function handlePalm(whatsappId, message, session) {
  const lang = session.language || 'en';
  const buffer = session.registrationBuffer || {};

  const text = extractText(message)?.toLowerCase().trim();
  if (text === 'skip') {
    await advanceAfterPalm(whatsappId, lang, { ...buffer, palmUrl: null });
    return;
  }

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

async function handleBirthTime(whatsappId, message, session) {
  const lang = session.language || 'en';
  const raw = extractText(message)?.trim();
  let birthTime = null;

  if (raw && raw.toLowerCase() !== 'skip') {
    const parsed = parseBirthTime(raw);
    if (!parsed) {
      await sendText(whatsappId, t('invalidBirthTime', lang));
      return;
    }
    birthTime = parsed;
  }

  const buffer = { ...(session.registrationBuffer || {}), birthTime };
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
      },
      { new: true }
    );
  } catch (err) {
    console.error('[Consult] Astro detail save error:', err.message);
    user = await User.findOne({ whatsappId });
  }

  await recordIntake(whatsappId, user, buffer);
  await sendText(whatsappId, t('astroExpertJoined', lang));
  await requestPayment(whatsappId, lang, user);
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

  await finish(whatsappId, lang, user, path);
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
