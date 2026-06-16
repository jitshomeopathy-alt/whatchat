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
 * Map a language code to its display name for prompt instructions.
 */
function languageName(code) {
  return code === 'hi' ? 'Hindi' : 'English';
}

/**
 * Generate the first personalized profile from the user's details and palm photo.
 * Uses a single GPT-4o vision call: the model analyses the attached palm photo
 * and produces the profile in one shot.
 *
 * @param {Object} details - { name, dob, age, city, language }
 * @param {string|null} imageUrl - Public URL of the user's palm photo (may be null)
 * @returns {Promise<string>} - Profile text (6 bullet points)
 */
async function astrologyReading(details, imageUrl) {
  const client = getClient();
  const language = languageName(details.language);

  const palmLine = imageUrl
    ? 'Derive the Palm Analysis from the attached palm photo.'
    : 'No palm photo was provided — infer a plausible reading from the other details.';

  const systemPrompt = `You are an expert astrologer and palmistry interpreter.

Based on:
- Name: ${details.name || ''}
- Date of Birth: ${details.dob || ''}
- Age: ${details.age ?? ''}
- Residence City: ${details.city || ''}
- Palm Analysis: ${palmLine}

Generate a short personalized profile consisting of exactly 6 bullet points.

Focus on:
1. Core personality traits
2. Thinking and decision-making style
3. Communication style
4. Career and ambition tendencies
5. Relationship and social behavior
6. Hidden strength or growth area

Requirements:
- Each bullet should be 1-2 sentences.
- Sound highly personalized and specific.
- Use confident but non-absolute language.
- Do not mention astrology signs, planets, houses, palm lines, or technical terms.
- Do not make health, legal, financial, or lifespan predictions.
- Avoid generic statements that could apply to everyone.
- Make the profile feel insightful and relatable.
- Return only the bullet points.
- Write the entire response in ${language}.`;

  const userContent = [{ type: 'text', text: 'Generate the profile.' }];
  if (imageUrl) {
    userContent.push({ type: 'image_url', image_url: { url: imageUrl, detail: 'low' } });
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: 600,
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

const REVIEW_SYSTEM_PROMPT = `You are a compassionate homeopathic health advisor.
You receive a user's category and their answers to a fixed questionnaire.
Based ONLY on those answers, return a single JSON object with exactly these keys:

{
  "message": "the warm, supportive text the user will read on WhatsApp",
  "medicines": [ { "name": "remedy name", "reason": "one-line reason it was chosen" } ]
}

Rules for "message" (shown to the user):
1. Keep it under 220 words, warm and reassuring.
2. Open by reflecting back what their answers indicate ("Based on what you've shared...").
3. Reassure them that a personalised remedy plan has been prepared for them.
4. NEVER name, mention, abbreviate, or hint at any specific medicine, remedy, brand,
   ingredient, or product. Refer only generally to "a personalised remedy plan" or
   "the recommended remedies". This is a strict requirement.
5. End with a gentle reminder that this is informational and not a substitute for a doctor.
6. Do not diagnose serious conditions.

Rules for "medicines" (internal — for the care team only, NEVER shown to the user):
1. List 1-4 concrete suggested remedies, each with a short one-line reason.
2. These names must never appear anywhere in "message".

Write the human-readable text ("message" and each "reason") in the requested output language.
Return ONLY the JSON object, with no surrounding text or markdown.`;

const reviewCategoryLabels = {
  addiction: 'De-addiction / Substance Recovery',
  mental: 'Mental / Emotional Wellness',
  sex: 'Sexual Health & Wellness',
};

/**
 * Review the user's questionnaire answers and produce the final result text
 * shown to the user ("we reviewed your illness based on your answers and
 * created your medicines...").
 *
 * The question/answer pairs are sent directly to the model and the model's
 * answer is shown to the user.
 *
 * ⚠️ PLACEHOLDER PROMPT — the real system prompt will be provided later.
 *
 * @param {Object} params
 * @param {string} params.category   - 'addiction' | 'mental' | 'sex'
 * @param {string[]} params.questions - Questions asked, in order
 * @param {string[]} params.answers   - User's answers, aligned with questions
 * @param {Object} [params.user]     - { name, age, gender, ... } (optional context)
 * @param {string} [params.astrologyResult] - Earlier profile reading (optional context)
 * @param {string} [params.language] - 'en' | 'hi' (output language)
 * @returns {Promise<{ message: string, medicines: Array<{ name: string, reason: string }> }>}
 *   message    - user-facing text (contains NO direct medicine names)
 *   medicines  - internal remedy suggestions for the care team / admin only
 */
async function reviewAndPrescribe({ category, questions, answers, user, astrologyResult, language }) {
  const client = getClient();

  const label = reviewCategoryLabels[category] || category;
  const outputLanguage = languageName(language);

  const qaPairs = questions
    .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || '(no answer)'}`)
    .join('\n\n');

  const userBlocks = [];
  if (user || astrologyResult) {
    const ctx = [];
    if (user?.name) ctx.push(`Name: ${user.name}`);
    if (user?.age != null) ctx.push(`Age: ${user.age}`);
    if (user?.gender) ctx.push(`Gender: ${user.gender}`);
    if (astrologyResult) ctx.push(`Profile reading: ${astrologyResult}`);
    if (ctx.length) userBlocks.push(`Context:\n${ctx.join('\n')}`);
  }
  userBlocks.push(`Category: ${label}\n\nQuestionnaire responses:\n\n${qaPairs}`);
  userBlocks.push(`Write the human-readable text in ${outputLanguage}.`);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: REVIEW_SYSTEM_PROMPT },
      { role: 'user', content: userBlocks.join('\n\n') },
    ],
    max_tokens: 1500,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content.trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    // If the model didn't return valid JSON, fall back to treating the whole
    // output as the user message with no separate medicine list. This keeps the
    // user experience safe (no stray medicine names leak through structure loss).
    console.error('[OpenAI] reviewAndPrescribe JSON parse failed:', err.message);
    return { message: raw, medicines: [] };
  }

  const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';
  const medicines = Array.isArray(parsed.medicines)
    ? parsed.medicines
        .filter((m) => m && (m.name || m.reason))
        .map((m) => ({
          name: String(m.name || '').trim(),
          reason: String(m.reason || '').trim(),
        }))
    : [];

  return { message, medicines };
}

module.exports = { analyseUser, astrologyReading, recoverSynthesis, detectCategory, embedText, reviewAndPrescribe };
