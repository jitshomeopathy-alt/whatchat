const OpenAI = require('openai');

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

/**
 * Analyse a user's health profile + optional photo using GPT-4o (vision).
 * @param {Object} userProfile - { name, age, gender, email, imageUrl }
 * @param {string|null} imageUrl - Public ImageKit URL of user photo (may be null)
 * @returns {Promise<string>} - Analysis text
 */
async function analyseUser(userProfile, imageUrl) {
  const client = getClient();

  const systemPrompt = `You are a professional health and wellness assessment AI.
You will receive a user profile and optionally a photo. Your role is to:
1. Provide a comprehensive wellness assessment based on the available information.
2. Identify potential physical, mental, and lifestyle health concerns.
3. Suggest which category of support the user might most benefit from:
   - Category addiction: De-addiction / Substance recovery
   - Category mental: Mental / Emotional wellness
   - Category sex: Sexual health & wellness
4. Be empathetic, non-alarmist, and professional.
5. Keep your response under 500 words.
6. End with a line: "Recommended category: addiction", "Recommended category: mental", or "Recommended category: sex"`;

  const userContent = [];

  userContent.push({
    type: 'text',
    text: `Please analyse this user's health profile:
Name: ${userProfile.name}
Age: ${userProfile.age}
Gender: ${userProfile.gender}
Email: ${userProfile.email}

Please provide a thorough wellness assessment and recommend which support category best suits them.`,
  });

  if (imageUrl) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: imageUrl,
        detail: 'low',
      },
    });
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: 700,
    temperature: 0.4,
  });

  return response.choices[0].message.content.trim();
}

/**
 * Generate a basic astrological reading from the user's birth details.
 *
 * ⚠️ PLACEHOLDER PROMPT — the real astrology prompt will be provided later.
 * Swap out `systemPrompt` / `userMessage` below without touching the call site.
 *
 * @param {Object} details - { name, dob, raashi, address, age, gender }
 * @returns {Promise<string>} - Astrology reading text
 */
async function astrologyReading(details) {
  const client = getClient();

  // ── PLACEHOLDER PROMPT (replace later) ──────────────────────────────────────
  const systemPrompt = `You are an astrology and wellness guide. Given a person's
basic birth details, produce a short, warm, general astrological reading focused
on temperament, current emotional tendencies, and well-being. Keep it under 200
words. Do NOT make medical claims. [PLACEHOLDER PROMPT — to be replaced.]`;

  const userMessage = `Birth details:
Name: ${details.name || ''}
Date of birth: ${details.dob || ''}
Raashi (moon sign): ${details.raashi || ''}
Address: ${details.address || ''}
Age: ${details.age ?? ''}
Gender: ${details.gender || ''}

Please give a brief astrological reading.`;
  // ────────────────────────────────────────────────────────────────────────────

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
}

/**
 * Synthesise a recovery recommendation from Q&A answers.
 * @param {string} category - 'X', 'Y', or 'Z'
 * @param {string[]} answers - Array of answers matching the question set
 * @param {string[]} questions - Array of questions asked
 * @returns {Promise<string>} - Synthesis/recommendation text
 */
async function recoverSynthesis(category, answers, questions) {
  const client = getClient();

  const categoryLabels = {
    addiction: 'De-addiction / Substance Recovery',
    mental: 'Mental / Emotional Wellness',
    sex: 'Sexual Health & Wellness',
  };

  const categoryLabel = categoryLabels[category] || category;

  const qaPairs = questions
    .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || '(no answer)'}`)
    .join('\n\n');

  const systemPrompt = `You are a compassionate health and wellness advisor specialising in ${categoryLabel}.
Based on the user's responses to a health questionnaire, provide:
1. A summary of their current health situation.
2. Key concerns identified from their answers.
3. Practical, evidence-based recommendations for improvement.
4. A brief motivational closing statement.
Keep your response concise (under 400 words), warm, and actionable.
Do NOT diagnose medical conditions. Always recommend consulting a healthcare professional for serious concerns.`;

  const userMessage = `Category: ${categoryLabel}\n\nUser's health questionnaire responses:\n\n${qaPairs}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 600,
    temperature: 0.5,
  });

  return response.choices[0].message.content.trim();
}

/**
 * Detect which recovery category best matches an analysis text.
 * @param {string} analysisText - The text from analyseUser()
 * @returns {Promise<'X'|'Y'|'Z'>} - Best matching category
 */
async function detectCategory(analysisText) {
  // First try to parse the "Recommended category: health/mental/sex" line
  const match = analysisText.match(/Recommended category:\s*(addiction|mental|sex)/i);
  if (match) {
    return match[1].toLowerCase();
  }

  // Fallback: ask GPT to classify
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You classify health analysis text into one of three categories. Reply with ONLY one word: addiction (substance/de-addiction), mental (mental/emotional), or sex (sexual health).',
      },
      {
        role: 'user',
        content: `Classify this health analysis:\n\n${analysisText}`,
      },
    ],
    max_tokens: 10,
    temperature: 0,
  });

  const word = response.choices[0].message.content.trim().toLowerCase();
  if (['addiction', 'mental', 'sex'].includes(word)) return word;

  // Default fallback
  return 'addiction';
}

/**
 * Create an embedding vector for a text string.
 * @param {string} text
 * @returns {Promise<number[]>} - 1536-dim embedding
 */
async function embedText(text) {
  const client = getClient();

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });

  return response.data[0].embedding;
}

module.exports = { analyseUser, astrologyReading, recoverSynthesis, detectCategory, embedText };
