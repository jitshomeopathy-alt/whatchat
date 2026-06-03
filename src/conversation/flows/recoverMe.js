const { sendText } = require('../../services/whatsapp');
const { recoverSynthesis } = require('../../services/openai');
const { searchMedicines } = require('../../services/qdrant');
const { saveSession, resetSession } = require('../stateManager');
const questions = require('../questions');
const User = require('../../models/User');
const AnalysisHistory = require('../../models/AnalysisHistory');

/**
 * Handle the "recover me" flow.
 * @param {string} whatsappId
 * @param {Object} message - Parsed WhatsApp message object
 * @param {Object} session - Current session document
 */
async function handle(whatsappId, message, session) {
  const user = await User.findOne({ whatsappId });

  if (!user) {
    await sendText(
      whatsappId,
      'I need your profile before I can start recovery mode. Please type *"register"* to get started.'
    );
    await saveSession(whatsappId, { state: 'IDLE' });
    return;
  }

  // ── Entry point: Show category selection ─────────────────────────────────────
  if (session.state === 'REGISTERED' || session.state === 'ANALYSE_DONE' || session.state === 'RECOVER_DONE') {
    // If we already have a category from analyse, suggest it
    const suggestedCat = session.category;

    let prompt =
      `🌿 *Recovery Mode*\n\nI'll ask you some targeted questions and then suggest personalised remedies.\n\n` +
      `Please choose your recovery category by replying with *X*, *Y*, or *Z*:\n\n` +
      `*X* — Physical / Pain Management (5 questions)\n` +
      `*Y* — Mental / Emotional Wellness (7 questions)\n` +
      `*Z* — Chronic / Lifestyle Conditions (10 questions)`;

    if (suggestedCat) {
      prompt += `\n\n💡 Based on your health analysis, I recommend *Category ${suggestedCat}*.`;
    }

    await saveSession(whatsappId, {
      state: 'RECOVER_CATEGORY_SELECT',
      recoverAnswers: [],
      currentQuestion: 0,
    });

    await sendText(whatsappId, prompt);
    return;
  }

  // ── Category selection ────────────────────────────────────────────────────────
  if (session.state === 'RECOVER_CATEGORY_SELECT') {
    const text = extractText(message)?.trim().toUpperCase();

    if (!['X', 'Y', 'Z'].includes(text)) {
      await sendText(whatsappId, 'Please reply with *X*, *Y*, or *Z* to select your recovery category.');
      return;
    }

    const category = text;
    const firstQuestion = questions[category][0];

    await saveSession(whatsappId, {
      state: 'RECOVER_Q',
      category,
      recoverAnswers: [],
      currentQuestion: 0,
    });

    await sendText(
      whatsappId,
      `✅ Starting *Category ${category}* recovery questionnaire.\n\n` +
        `I'll ask you ${questions[category].length} questions. Please answer honestly.\n\n` +
        `*Question 1 of ${questions[category].length}:*\n${firstQuestion}`
    );
    return;
  }

  // ── Ongoing questionnaire ─────────────────────────────────────────────────────
  if (session.state === 'RECOVER_Q') {
    const answer = extractText(message);

    if (!answer || answer.trim().length === 0) {
      await sendText(whatsappId, 'Please provide a text answer to continue.');
      return;
    }

    const category = session.category;
    const currentQ = session.currentQuestion;
    const categoryQuestions = questions[category];
    const updatedAnswers = [...(session.recoverAnswers || []), answer.trim()];
    const nextQ = currentQ + 1;

    // More questions to ask?
    if (nextQ < categoryQuestions.length) {
      await saveSession(whatsappId, {
        recoverAnswers: updatedAnswers,
        currentQuestion: nextQ,
      });

      await sendText(
        whatsappId,
        `*Question ${nextQ + 1} of ${categoryQuestions.length}:*\n${categoryQuestions[nextQ]}`
      );
      return;
    }

    // ── All questions answered: synthesise and recommend ──────────────────────
    await saveSession(whatsappId, {
      recoverAnswers: updatedAnswers,
      currentQuestion: nextQ,
      state: 'RECOVER_DONE',
    });

    await sendText(
      whatsappId,
      `✅ All questions answered! Generating your personalised recovery plan...\n⏳ Please wait a moment.`
    );

    // Build synthesis text for Qdrant search
    const symptomSummary = categoryQuestions
      .map((q, i) => `${q}: ${updatedAnswers[i] || ''}`)
      .join('. ');

    let synthesisText = '';
    let medicineResults = [];

    // 1. GPT synthesis
    try {
      synthesisText = await recoverSynthesis(category, updatedAnswers, categoryQuestions);
    } catch (err) {
      console.error('[RecoverMe] Synthesis error:', err.message);
      synthesisText = 'I was unable to generate a full synthesis at this time. Please try again.';
    }

    // 2. Qdrant medicine search
    try {
      const searchText = `${symptomSummary} ${synthesisText}`.slice(0, 1000);
      medicineResults = await searchMedicines(searchText, 5);
    } catch (err) {
      console.error('[RecoverMe] Qdrant search error:', err.message);
      medicineResults = [];
    }

    // 3. Save to analysis history
    try {
      const medicinesPayload = medicineResults.map((r) => ({
        name: r.payload.name,
        description: r.payload.description,
        category: r.payload.category,
        score: r.score,
      }));

      await AnalysisHistory.create({
        userId: user._id,
        whatsappId,
        type: 'recover',
        prompt: symptomSummary.slice(0, 1000),
        response: synthesisText,
        medicines: medicinesPayload,
      });
    } catch (err) {
      console.error('[RecoverMe] History save error:', err.message);
    }

    // 4. Format final message
    const categoryLabels = {
      X: 'Physical / Pain Management',
      Y: 'Mental / Emotional Wellness',
      Z: 'Chronic / Lifestyle Conditions',
    };

    let finalMessage =
      `🌿 *Recovery Plan — Category ${category}: ${categoryLabels[category]}*\n\n` +
      `${synthesisText}`;

    if (medicineResults.length > 0) {
      finalMessage += `\n\n---\n💊 *Recommended Remedies & Supplements:*\n`;
      medicineResults.forEach((med, i) => {
        const p = med.payload;
        finalMessage += `\n${i + 1}. *${p.name}* (${p.category})\n   ${p.description}\n`;
        if (p.tags && p.tags.length > 0) {
          finalMessage += `   _Tags: ${p.tags.join(', ')}_\n`;
        }
      });
    }

    finalMessage +=
      `\n---\n⚠️ _These suggestions are for informational purposes only. Please consult a qualified healthcare professional before starting any new treatment._\n\n` +
      `Type *"analyse me"* for a fresh health analysis or *"recover me"* to start a new questionnaire.`;

    await sendText(whatsappId, finalMessage);
    return;
  }
}

function extractText(message) {
  if (message.type === 'text') return message.text?.body || '';
  return null;
}

module.exports = { handle };
