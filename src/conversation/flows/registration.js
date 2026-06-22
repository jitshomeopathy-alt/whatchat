const { sendText, sendButtons, downloadMedia } = require('../../services/whatsapp');
const { uploadFromUrl } = require('../../services/imagekit');
const { saveSession } = require('../stateManager');
const { formatDob, isValidDob } = require('../../utils/date');
const consultFlow = require('./consult');
const { t } = require('../i18n');
const User = require('../../models/User');

/**
 * Handle registration flow.
 * @param {string} whatsappId
 * @param {Object} message - Parsed WhatsApp message object
 * @param {Object} session - Current session document
 */
async function handle(whatsappId, message, session) {
  const state = session.state;

  // ── IDLE: kick off registration — ask language first ─────────────────────────
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

  // ── REGISTERING_LANGUAGE ─────────────────────────────────────────────────────
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

    const buffer = { ...(session.registrationBuffer || {}), language };
    await saveSession(whatsappId, {
      state: 'PURPOSE_SELECT',
      language,
      registrationBuffer: buffer,
    });
    // Short intro about Astro Vaidhya, then ask why they're here.
    await sendText(whatsappId, t('intro', language));
    await sendButtons(
      whatsappId,
      t('purposePrompt', language),
      [
        { id: 'purpose:consult', title: t('purposeConsult', language) },
        { id: 'purpose:explore', title: t('purposeExplore', language) },
      ]
    );
    return;
  }

  // ── PURPOSE_SELECT ───────────────────────────────────────────────────────────
  if (state === 'PURPOSE_SELECT') {
    const lang = session.language || 'en';
    const raw = (message.interactive?.id || extractText(message) || '').toLowerCase().trim();
    let purpose = null;
    if (raw === 'purpose:consult' || raw.includes('consult') || raw.includes('doctor')) purpose = 'consult';
    else if (raw === 'purpose:explore' || raw.includes('explore') || raw.includes('astro')) purpose = 'explore';

    if (!purpose) {
      await sendButtons(
        whatsappId,
        t('purposeRetry', lang),
        [
          { id: 'purpose:consult', title: t('purposeConsult', lang) },
          { id: 'purpose:explore', title: t('purposeExplore', lang) },
        ]
      );
      return;
    }

    // "Consult a doctor" → hand off to the doctor-consult flow. We keep the user
    // unregistered (IDLE) so a later "hi" can restart and explore if they wish.
    if (purpose === 'consult') {
      await saveSession(whatsappId, { state: 'IDLE', registrationBuffer: {} });
      await sendText(whatsappId, t('consultDirect', lang));
      return;
    }

    // "Explore Astro Vaidhya" → continue the normal registration journey.
    await saveSession(whatsappId, { state: 'REGISTERING_NAME' });
    await sendText(whatsappId, t('askName', lang));
    return;
  }

  // ── REGISTERING_NAME ─────────────────────────────────────────────────────────
  if (state === 'REGISTERING_NAME') {
    const lang = session.language || 'en';
    const name = extractText(message);
    if (!name || name.length < 2) {
      await sendText(whatsappId, t('invalidName', lang));
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), name };
    await saveSession(whatsappId, {
      state: 'REGISTERING_AGE',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askAge', lang, { name }));
    return;
  }

  // ── REGISTERING_AGE ──────────────────────────────────────────────────────────
  if (state === 'REGISTERING_AGE') {
    const lang = session.language || 'en';
    const text = extractText(message);
    const age = parseInt(text, 10);

    if (isNaN(age) || age < 1 || age > 150) {
      await sendText(whatsappId, t('invalidAge', lang));
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), age };
    await saveSession(whatsappId, {
      state: 'REGISTERING_GENDER',
      registrationBuffer: buffer,
    });
    await sendButtons(
      whatsappId,
      t('askGender', lang, { age }),
      [
        { id: 'male', title: t('genderMale', lang) },
        { id: 'female', title: t('genderFemale', lang) },
        { id: 'other', title: t('genderOther', lang) },
      ]
    );
    return;
  }

  // ── REGISTERING_GENDER ───────────────────────────────────────────────────────
  if (state === 'REGISTERING_GENDER') {
    const lang = session.language || 'en';
    const text = (message.interactive?.id || extractText(message))?.toLowerCase().trim();
    const allowed = ['male', 'female', 'other'];

    if (!allowed.includes(text)) {
      await sendButtons(
        whatsappId,
        t('genderRetry', lang),
        [
          { id: 'male', title: t('genderMale', lang) },
          { id: 'female', title: t('genderFemale', lang) },
          { id: 'other', title: t('genderOther', lang) },
        ]
      );
      return;
    }

    // Email collection is paused for now — go straight to the birth details.
    // The palm photo is collected last, just before the astrology reading.
    const buffer = { ...(session.registrationBuffer || {}), gender: text };
    await saveSession(whatsappId, {
      state: 'REGISTERING_DOB',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askDob', lang));
    return;
  }

  // ── REGISTERING_DOB ──────────────────────────────────────────────────────────
  if (state === 'REGISTERING_DOB') {
    const lang = session.language || 'en';
    const dobInput = extractText(message)?.trim();
    if (!isValidDob(dobInput)) {
      await sendText(whatsappId, t('invalidDob', lang));
      return;
    }

    const dob = formatDob(dobInput); // normalized to dd-mm-yyyy
    const buffer = { ...(session.registrationBuffer || {}), dob };
    await saveSession(whatsappId, {
      state: 'REGISTERING_BIRTH_TIME',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askBirthTime', lang));
    return;
  }

  // ── REGISTERING_BIRTH_TIME ────────────────────────────────────────────────────
  if (state === 'REGISTERING_BIRTH_TIME') {
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
    await saveSession(whatsappId, {
      state: 'REGISTERING_ADDRESS',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askAddress', lang, { dob: buffer.dob }));
    return;
  }

  // ── REGISTERING_ADDRESS → ask for the palm photo (last question) ──────────────
  if (state === 'REGISTERING_ADDRESS') {
    const lang = session.language || 'en';
    const address = extractText(message)?.trim();
    if (!address || address.length < 2) {
      await sendText(whatsappId, t('invalidAddress', lang));
      return;
    }

    const buffer = { ...(session.registrationBuffer || {}), address };
    await saveSession(whatsappId, {
      state: 'REGISTERING_IMAGE',
      registrationBuffer: buffer,
    });
    await sendText(whatsappId, t('askImage', lang));
    return;
  }

  // ── REGISTERING_IMAGE (final step → save + start astrology) ───────────────────
  if (state === 'REGISTERING_IMAGE') {
    const lang = session.language || 'en';
    const buffer = session.registrationBuffer || {};
    let imageUrl = null;

    const textInput = extractText(message)?.toLowerCase().trim();

    if (textInput === 'skip') {
      // User chose to skip photo
      imageUrl = null;
    } else if (message.type === 'image') {
      try {
        const mediaId = message.image?.id;
        if (!mediaId) {
          await sendText(whatsappId, t('imageReadError', lang));
          return;
        }

        await sendText(whatsappId, t('imageUploading', lang));
        const mediaBuffer = await downloadMedia(mediaId);
        const filename = `user_${whatsappId}_palm.jpg`;
        imageUrl = await uploadFromUrl(null, filename, mediaBuffer);
      } catch (err) {
        console.error('[Registration] Image upload error:', err.message);
        await sendText(whatsappId, t('imageUploadError', lang, { msg: err.message }));
        return;
      }
    } else {
      await sendText(whatsappId, t('imageSendPrompt', lang));
      return;
    }

    buffer.imageUrl = imageUrl;

    // Save the complete user profile to MongoDB
    let user;
    try {
      user = await User.findOneAndUpdate(
        { whatsappId },
        {
          whatsappId,
          name: buffer.name,
          age: buffer.age,
          gender: buffer.gender,
          imageUrl: buffer.imageUrl || null,
          language: buffer.language || 'en',
          dob: buffer.dob,
          birthTime: buffer.birthTime || null,
          address: buffer.address,
          createdAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('[Registration] User save error:', err.message);
      await sendText(whatsappId, t('saveError', lang));
      return;
    }

    await saveSession(whatsappId, {
      state: 'REGISTERED',
      registrationBuffer: {},
    });

    await sendText(whatsappId, t('profileComplete', lang, { name: buffer.name }));

    // Automatically generate the astrological reading (next step in the flow).
    await consultFlow.startAstrology(whatsappId, user);
    return;
  }
}

/**
 * Extract text from various message types.
 */
function extractText(message) {
  if (message.type === 'text') return message.text?.body || '';
  return null;
}

/**
 * Parse and normalise a free-text birth time into 24-hour "HH:MM".
 * Accepts "14:30", "9:05", "9.05", "0930", and 12-hour forms like "2:30 pm" /
 * "9 am". Returns the normalised string, or null if it can't be understood.
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
    // bare hour with am/pm, e.g. "9 am"
    hh = parseInt(m[1], 10);
    mm = 0;
  } else if ((m = /^(\d{2})(\d{2})$/.exec(cleaned))) {
    // compact "0930"
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

module.exports = { handle };
