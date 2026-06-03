const { sendText } = require('../../services/whatsapp');
const { analyseUser, detectCategory } = require('../../services/openai');
const { saveSession } = require('../stateManager');
const User = require('../../models/User');
const AnalysisHistory = require('../../models/AnalysisHistory');

/**
 * Handle the "analyse me" flow.
 * @param {string} whatsappId
 * @param {Object} message - Parsed WhatsApp message object
 * @param {Object} session - Current session document
 */
async function handle(whatsappId, message, session) {
  // Fetch user profile
  const user = await User.findOne({ whatsappId });

  if (!user) {
    await sendText(
      whatsappId,
      'I need your profile before I can analyse you. Please type *"register"* to get started.'
    );
    await saveSession(whatsappId, { state: 'IDLE' });
    return;
  }

  await sendText(
    whatsappId,
    `🔍 Analysing your health profile, *${user.name}*...\n\nThis may take a few seconds, please wait.`
  );

  let analysisText;
  try {
    analysisText = await analyseUser(
      {
        name: user.name,
        age: user.age,
        gender: user.gender,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      user.imageUrl
    );
  } catch (err) {
    console.error('[AnalyseMe] OpenAI error:', err.message);
    await sendText(
      whatsappId,
      'Sorry, the analysis service is temporarily unavailable. Please try again in a moment.'
    );
    await saveSession(whatsappId, { state: 'REGISTERED' });
    return;
  }

  // Detect recommended category
  let recommendedCategory = 'X';
  try {
    recommendedCategory = await detectCategory(analysisText);
  } catch (err) {
    console.error('[AnalyseMe] Category detection error:', err.message);
  }

  // Save to analysis history
  try {
    await AnalysisHistory.create({
      userId: user._id,
      whatsappId,
      type: 'analyse',
      prompt: `Profile: ${user.name}, ${user.age}, ${user.gender}`,
      response: analysisText,
      medicines: [],
    });
  } catch (err) {
    console.error('[AnalyseMe] History save error:', err.message);
  }

  // Update session
  await saveSession(whatsappId, {
    state: 'ANALYSE_DONE',
    category: recommendedCategory,
  });

  // Format and send the analysis
  const formattedResponse =
    `📊 *Health Analysis for ${user.name}*\n\n` +
    `${analysisText}\n\n` +
    `---\n` +
    `💡 Based on this analysis, your recommended support category is *${categoryLabel(recommendedCategory)}*.\n\n` +
    `Type *"recover me"* to begin your personalised recovery questionnaire, or *"help"* for other options.`;

  await sendText(whatsappId, formattedResponse);
}

function categoryLabel(cat) {
  const labels = {
    X: 'X — Physical / Pain Management',
    Y: 'Y — Mental / Emotional Wellness',
    Z: 'Z — Chronic / Lifestyle Conditions',
  };
  return labels[cat] || cat;
}

module.exports = { handle };
