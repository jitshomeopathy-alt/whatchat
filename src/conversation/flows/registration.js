const { sendText, sendButtons, sendList } = require('../../services/whatsapp');
const { saveSession, resetSession } = require('../stateManager');
const { personalitySummary } = require('../../services/openai');
const consultFlow = require('./consult');
const {
  t,
  introLines,
  concernOptions,
  affectOptions,
  severityOptions,
} = require('../i18n');
const User = require('../../models/User');

/**
 * Intake flow: language → intro → "ready?" → purpose → name → gender →
 * concern → realise → affect → severity → summary. On a confirmed summary we
 * save the user and hand off to the consult flow (path selection + payment).
 *
 * @param {string} whatsappId
 * @param {Object} message - Parsed WhatsApp message object
 * @param {Object} session - Current session document
 */
async function handle(whatsappId, message, session) {
  const state = session.state;

  // ── IDLE: kick off — ask language first ──────────────────────────────────────
  if (state === 'IDLE') {
    await saveSession(whatsappId, {
      state: 'REGISTERING_LANGUAGE',
      registrationBuffer: {},
    });
    await sendButtons(
      whatsappId,
      `👋 Welcome to Astro Vaidhya!\n\nPlease choose your language.\nकृपया अपनी भाषा चुनें।`,
      [
        { id: 'lang:en', title: 'English' },
        { id: 'lang:hi', title: 'हिंदी' },
      ]
    );
    return;
  }

  // ── REGISTERING_LANGUAGE → send the 7 intro lines + "Are you ready?" ──────────
  if (state === 'REGISTERING_LANGUAGE') {
    const raw = (message.interactive?.id || extractText(message) || '').toLowerCase().trim();
    let language = null;
    if (raw === 'lang:en' || raw === 'english' || raw === 'en') language = 'en';
    else if (raw === 'lang:hi' || raw === 'hindi' || raw === 'हिंदी' || raw === 'hi') language = 'hi';

    if (!language) {
      await sendButtons(
        whatsappId,
        'Please choose your language. / कृपया अपनी भाषा चुनें।',
        [
          { id: 'lang:en', title: 'English' },
          { id: 'lang:hi', title: 'हिंदी' },
        ]
      );
      return;
    }

    await saveSession(whatsappId, {
      state: 'READY_CONFIRM',
      language,
      registrationBuffer: { ...(session.registrationBuffer || {}), language },
    });

    // Send the intro messages one-by-one, then the readiness gate.
    for (const line of introLines(language)) {
      await sendText(whatsappId, line);
    }
    await sendButtons(whatsappId, t('readyPrompt', language), [
      { id: 'ready:yes', title: t('readyYes', language) },
      { id: 'ready:no', title: t('readyNo', language) },
    ]);
    return;
  }

  // ── READY_CONFIRM → yes: ask purpose · no: gentle reset ───────────────────────
  if (state === 'READY_CONFIRM') {
    const lang = session.language || 'en';
    const id = message.interactive?.id || null;
    const raw = (id || extractText(message) || '').toLowerCase().trim();
    let ready = null;
    if (id === 'ready:yes') ready = true;
    else if (id === 'ready:no') ready = false;
    else if (raw === 'yes' || raw.includes('ready')) ready = true;
    else if (raw === 'no' || raw.includes('not')) ready = false;

    if (ready === false) {
      await sendText(whatsappId, t('notReady', lang));
      await resetSession(whatsappId, false);
      return;
    }

    if (ready !== true) {
      await sendButtons(whatsappId, t('readyPrompt', lang), [
        { id: 'ready:yes', title: t('readyYes', lang) },
        { id: 'ready:no', title: t('readyNo', lang) },
      ]);
      return;
    }

    await saveSession(whatsappId, { state: 'PURPOSE_SELECT' });
    await sendButtons(whatsappId, t('purposePrompt', lang), [
      { id: 'purpose:explore', title: t('purposeExplore', lang) },
      { id: 'purpose:consult', title: t('purposeConsult', lang) },
    ]);
    return;
  }

  // ── PURPOSE_SELECT → consult: doctor + payment · explore: continue intake ─────
  if (state === 'PURPOSE_SELECT') {
    const lang = session.language || 'en';
    const raw = (message.interactive?.id || extractText(message) || '').toLowerCase().trim();
    let purpose = null;
    if (raw === 'purpose:consult' || raw.includes('consult') || raw.includes('doctor')) purpose = 'consult';
    else if (raw === 'purpose:explore' || raw.includes('explore') || raw.includes('astro')) purpose = 'explore';

    if (!purpose) {
      await sendButtons(whatsappId, t('purposeRetry', lang), [
        { id: 'purpose:explore', title: t('purposeExplore', lang) },
        { id: 'purpose:consult', title: t('purposeConsult', lang) },
      ]);
      return;
    }

    // "Consult a doctor" → straight to Dr. Jitendra Pal + payment (no intake).
    if (purpose === 'consult') {
      await consultFlow.startDoctorConsult(whatsappId, lang, null);
      return;
    }

    // "Explore Astro Vaidhya" → continue the intake journey.
    await saveSession(whatsappId, { state: 'REGISTERING_NAME' });
    await sendText(whatsappId, t('askName', lang));
    return;
  }

  // ── REGISTERING_NAME ─────────────────────────────────────────────────────────
  if (state === 'REGISTERING_NAME') {
    const lang = session.language || 'en';
    const name = extractText(message);
    if (!name || name.trim().length < 2) {
      await sendText(whatsappId, t('invalidName', lang));
      return;
    }

    await saveSession(whatsappId, {
      state: 'REGISTERING_GENDER',
      registrationBuffer: { ...(session.registrationBuffer || {}), name: name.trim() },
    });
    await sendButtons(whatsappId, t('askGender', lang), [
      { id: 'male', title: t('genderMale', lang) },
      { id: 'female', title: t('genderFemale', lang) },
      { id: 'other', title: t('genderOther', lang) },
    ]);
    return;
  }

  // ── REGISTERING_GENDER → "take your time" + concern list ──────────────────────
  if (state === 'REGISTERING_GENDER') {
    const lang = session.language || 'en';
    const gender = (message.interactive?.id || extractText(message))?.toLowerCase().trim();
    if (!['male', 'female', 'other'].includes(gender)) {
      await sendButtons(whatsappId, t('genderRetry', lang), [
        { id: 'male', title: t('genderMale', lang) },
        { id: 'female', title: t('genderFemale', lang) },
        { id: 'other', title: t('genderOther', lang) },
      ]);
      return;
    }

    await saveSession(whatsappId, {
      state: 'CONCERN_SELECT',
      gender,
      registrationBuffer: { ...(session.registrationBuffer || {}), gender },
    });
    await sendText(whatsappId, t('takeYourTime', lang));
    await sendConcernList(whatsappId, lang);
    return;
  }

  // ── CONCERN_SELECT ───────────────────────────────────────────────────────────
  if (state === 'CONCERN_SELECT') {
    const lang = session.language || 'en';
    const id = message.interactive?.id || null;
    const options = concernOptions(lang);

    // "In my words" → switch to free-text.
    if (id === 'concern:other') {
      await saveSession(whatsappId, { state: 'CONCERN_OTHER' });
      await sendText(whatsappId, t('concernInWords', lang));
      return;
    }

    const picked = options.find((o) => o.id === id);
    if (!picked) {
      await sendText(whatsappId, t('concernRetry', lang));
      return;
    }

    await saveSession(whatsappId, {
      state: 'CONCERN_REALIZE',
      registrationBuffer: { ...(session.registrationBuffer || {}), concern: picked.value },
    });
    await sendText(whatsappId, t('concernThanks', lang));
    await sendText(whatsappId, t('realizePrompt', lang));
    return;
  }

  // ── CONCERN_OTHER (free-text concern) ─────────────────────────────────────────
  if (state === 'CONCERN_OTHER') {
    const lang = session.language || 'en';
    const concern = extractText(message)?.trim();
    if (!concern || concern.length < 3) {
      await sendText(whatsappId, t('concernInWordsRetry', lang));
      return;
    }

    await saveSession(whatsappId, {
      state: 'CONCERN_REALIZE',
      registrationBuffer: { ...(session.registrationBuffer || {}), concern: concern.slice(0, 1000) },
    });
    await sendText(whatsappId, t('concernThanks', lang));
    await sendText(whatsappId, t('realizePrompt', lang));
    return;
  }

  // ── CONCERN_REALIZE (free-text) → affect question ─────────────────────────────
  if (state === 'CONCERN_REALIZE') {
    const lang = session.language || 'en';
    const realize = extractText(message)?.trim();
    if (!realize || realize.length < 2) {
      await sendText(whatsappId, t('realizeRetry', lang));
      return;
    }

    await saveSession(whatsappId, {
      state: 'CONCERN_AFFECT',
      registrationBuffer: { ...(session.registrationBuffer || {}), realize: realize.slice(0, 1000) },
    });
    await sendList(
      whatsappId,
      t('affectPrompt', lang),
      t('affectButton', lang),
      affectOptions(lang).map((o) => ({ id: o.id, title: o.title })),
      { header: t('affectHeader', lang), sectionTitle: t('affectSection', lang) }
    );
    return;
  }

  // ── CONCERN_AFFECT → severity question ────────────────────────────────────────
  if (state === 'CONCERN_AFFECT') {
    const lang = session.language || 'en';
    const id = message.interactive?.id || null;
    const picked = affectOptions(lang).find((o) => o.id === id);
    if (!picked) {
      await sendText(whatsappId, t('affectRetry', lang));
      return;
    }

    await saveSession(whatsappId, {
      state: 'CONCERN_SEVERITY',
      registrationBuffer: { ...(session.registrationBuffer || {}), affect: picked.value },
    });
    await sendList(
      whatsappId,
      t('severityPrompt', lang),
      t('severityButton', lang),
      severityOptions(lang).map((o) => ({ id: o.id, title: o.title })),
      { header: t('severityHeader', lang), sectionTitle: t('severitySection', lang) }
    );
    return;
  }

  // ── CONCERN_SEVERITY → summary + confirm ──────────────────────────────────────
  if (state === 'CONCERN_SEVERITY') {
    const lang = session.language || 'en';
    const id = message.interactive?.id || null;
    const picked = severityOptions(lang).find((o) => o.id === id);
    if (!picked) {
      await sendText(whatsappId, t('severityRetry', lang));
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), severity: picked.value };
    await saveSession(whatsappId, { state: 'SUMMARY_CONFIRM', registrationBuffer: buffer });
    await sendSummary(whatsappId, lang, buffer);
    return;
  }

  // ── SUMMARY_CONFIRM → yes: save + path select · no: redo concern ──────────────
  if (state === 'SUMMARY_CONFIRM') {
    const lang = session.language || 'en';
    const raw = (message.interactive?.id || extractText(message) || '').toLowerCase().trim();
    const yes = raw === 'summary:yes' || raw === 'yes' || raw.includes('right') || raw.includes('correct');
    const no = raw === 'summary:no' || raw === 'no' || raw.includes('quite') || raw.includes('wrong');

    // "Not quite" → don't restart the flow; just let them explain more about
    // themselves in their own words.
    if (no && !yes) {
      await saveSession(whatsappId, { state: 'SUMMARY_CLARIFY' });
      await sendText(whatsappId, t('summaryClarify', lang));
      return;
    }

    if (!yes) {
      await sendSummary(whatsappId, lang, session.registrationBuffer || {});
      return;
    }

    // Confirmed — persist the user, then hand off to path selection.
    await saveAndStartPath(whatsappId, lang, session.registrationBuffer || {});
    return;
  }

  // ── SUMMARY_CLARIFY → capture the extra explanation, then continue ────────────
  if (state === 'SUMMARY_CLARIFY') {
    const lang = session.language || 'en';
    const extra = extractText(message)?.trim();
    if (!extra || extra.length < 3) {
      await sendText(whatsappId, t('summaryClarifyRetry', lang));
      return;
    }

    // Fold the user's own words into the concern so the care team sees them,
    // then move forward without restarting the flow.
    const prev = session.registrationBuffer || {};
    const concern = [prev.concern, extra].filter(Boolean).join(' — ').slice(0, 1000);
    const buffer = { ...prev, concern };

    await sendText(whatsappId, t('summaryClarifyThanks', lang));
    await saveAndStartPath(whatsappId, lang, buffer);
    return;
  }
}

/** Persist the user from the intake buffer, then hand off to path selection. */
async function saveAndStartPath(whatsappId, lang, buffer) {
  let user;
  try {
    user = await User.findOneAndUpdate(
      { whatsappId },
      {
        whatsappId,
        name: buffer.name,
        gender: buffer.gender,
        language: lang,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('[Registration] User save error:', err.message);
    await sendText(whatsappId, t('saveError', lang));
    return;
  }

  // Share a short 3–4 point personality read (from ChatGPT) before the user
  // chooses a path. Best-effort — a failure here never blocks the journey.
  await sendPersonalitySummary(whatsappId, lang, buffer);

  await consultFlow.startPathSelect(whatsappId, user, buffer);
}

/**
 * Generate and send a 3–4 point personality read from the intake answers.
 * Best-effort: on any error we send a gentle fallback and continue.
 */
async function sendPersonalitySummary(whatsappId, lang, buffer) {
  try {
    const read = await personalitySummary({
      name: buffer.name,
      gender: buffer.gender,
      concern: buffer.concern,
      realize: buffer.realize,
      affect: buffer.affect,
      severity: buffer.severity,
      language: lang,
    });
    if (read) {
      await sendText(whatsappId, `${t('personalityIntro', lang)}\n\n${read}`);
      return;
    }
  } catch (err) {
    console.error('[Registration] Personality summary error:', err.message);
  }
  await sendText(whatsappId, t('personalityError', lang));
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function sendConcernList(whatsappId, lang) {
  await sendList(
    whatsappId,
    t('concernPrompt', lang),
    t('concernButton', lang),
    concernOptions(lang).map((o) => ({ id: o.id, title: o.title, description: o.description })),
    { header: t('concernHeader', lang), sectionTitle: t('concernSection', lang) }
  );
}

async function sendSummary(whatsappId, lang, buffer) {
  const genderLabels = {
    male: t('genderMale', lang),
    female: t('genderFemale', lang),
    other: t('genderOther', lang),
  };
  await sendText(
    whatsappId,
    `${t('summaryIntro', lang)}\n\n` +
      t('summaryBody', lang, {
        name: buffer.name || '—',
        gender: genderLabels[buffer.gender] || buffer.gender || '—',
        concern: buffer.concern || '—',
        realize: buffer.realize || '—',
        affect: buffer.affect || '—',
        severity: buffer.severity || '—',
      })
  );
  await sendButtons(whatsappId, t('summaryConfirmPrompt', lang), [
    { id: 'summary:yes', title: t('summaryYes', lang) },
    { id: 'summary:no', title: t('summaryNo', lang) },
  ]);
}

/** Extract text from a text message (interactive taps are read via .interactive). */
function extractText(message) {
  if (message.type === 'text') return message.text?.body || '';
  return null;
}

module.exports = { handle };
