const Session = require('../models/Session');

/**
 * Load the session for a given whatsappId, creating it if it doesn't exist.
 * @param {string} whatsappId
 * @returns {Promise<Object>} Mongoose session document
 */
async function loadSession(whatsappId) {
  let session = await Session.findOne({ whatsappId });

  if (!session) {
    session = await Session.create({
      whatsappId,
      state: 'IDLE',
      category: null,
      registrationBuffer: {},
      recoverAnswers: [],
      currentQuestion: 0,
      updatedAt: new Date(),
    });
  }

  return session;
}

/**
 * Update session fields for a given whatsappId atomically.
 * Uses findOneAndUpdate with upsert to be safe under concurrent requests.
 * @param {string} whatsappId
 * @param {Object} updates - Partial session fields to update
 * @returns {Promise<Object>} Updated session document
 */
async function saveSession(whatsappId, updates) {
  const updated = await Session.findOneAndUpdate(
    { whatsappId },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return updated;
}

/**
 * Reset a session back to REGISTERED state (or IDLE if user not registered).
 * @param {string} whatsappId
 * @param {boolean} isRegistered
 */
async function resetSession(whatsappId, isRegistered = true) {
  return saveSession(whatsappId, {
    state: isRegistered ? 'REGISTERED' : 'IDLE',
    category: null,
    recoverAnswers: [],
    currentQuestion: 0,
  });
}

module.exports = { loadSession, saveSession, resetSession };
