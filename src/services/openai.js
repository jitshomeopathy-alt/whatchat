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
 * Uses a single GPT-4o vision call: the model reads the attached palm photo and
 * synthesises it with the birth details into a condensed astrology+palmistry
 * "Self & Constitution" reading in one shot.
 *
 * @param {Object} details - { name, dob, age, gender, city, language }
 * @param {string|null} imageUrl - Public URL of the user's palm photo (may be null)
 * @returns {Promise<string>} - Condensed Self & Constitution reading (labelled sections)
 */
async function astrologyReading(details, imageUrl) {
  // First attempt: include the photo (if any) as light inspiration. If the
  // vision model refuses to engage with the image, transparently fall back to
  // a details-only reading so the user always receives a profile.
  if (imageUrl) {
    const withImage = await generateReading(details, imageUrl);
    if (!looksLikeRefusal(withImage)) return withImage;
    console.warn('[OpenAI] Vision model declined the palm photo — retrying without image.');
  }
  return generateReading(details, null);
}

/**
 * Heuristic: did the model return a refusal / "I can't analyze this image"
 * style message instead of an actual reading?
 */
function looksLikeRefusal(text) {
  if (!text) return true;
  const t = text.toLowerCase();
  const phrases = [
    "i'm sorry",
    'i am sorry',
    "i can't help",
    'i cannot help',
    "i can't assist",
    'i cannot assist',
    "i can't identify",
    'i cannot identify',
    "i can't analyze",
    'i cannot analyze',
    "i'm unable to",
    'i am unable to',
    'unable to identify',
    'unable to analyze',
    'as an ai',
  ];
  return phrases.some((p) => t.includes(p));
}

/**
 * Single GPT-4o call that produces the 6-bullet profile.
 * @param {Object} details - { name, dob, age, city, language }
 * @param {string|null} imageUrl - palm photo URL, or null for a details-only reading
 */
async function generateReading(details, imageUrl) {
  const client = getClient();
  const language = languageName(details.language);

  const palmLine = imageUrl
    ? 'A photo of the person\'s palm/hand is attached. Read its general character cues (overall shape, dominant mounts, the look and flow of the major lines) and weave them into the personality synthesis. Treat this as a character/temperament reading only — never as a medical, identity, age, or lifespan claim, and do not narrate the image clinically.'
    : 'No palm photo was provided — build the reading from the birth and personal details, and present palmistry cues as gentle, plausible tendencies rather than facts.';

  const systemPrompt = `You are an integrated personality guide who synthesises Vedic astrology (Parashari/BPHS, with light KP and Nadi sensibility), Samudrika Shastra (palmistry), and Lal Kitab temperament reading into one warm, grounded character portrait.

Person:
- Name: ${details.name || ''}
- Date of Birth: ${details.dob || ''}
- Time of Birth: ${details.birthTime || 'unknown'}
- Age: ${details.age ?? ''}
- Gender: ${details.gender || ''}
- Residence City: ${details.city || ''}
- Palm: ${palmLine}

Produce a CONDENSED "Self & Constitution" reading. Write the following sections IN ORDER, each as a bold heading followed by 1–2 tight sentences (never more). Keep the whole reading comfortably readable on a phone.

1. *Outer personality* — how they come across to others.
2. *Inner personality* — who they are privately, underneath the surface.
3. *Core temperament & emotional style* — their baseline nature and how they feel and process emotion.
4. *Mental style* — how they think, decide, and handle information.
5. *Relationships* — their pattern in love, friendship, and trust.
6. *Shadow & vulnerability* — the recurring blind spot or self-sabotage, said kindly.
7. *Hidden strengths* — under-used gifts they can lean on.
8. *Life purpose / destiny theme* — the through-line of their path.
9. *Work & career pattern* — how they perform, lead, and where they thrive or stall.
10. *Stress signature & life rhythm* — how stress shows up, plus the broad ups-and-downs pattern of their life.

Then add one short closing block:
*In short* — 2–3 sentences on who this person is, what truly drives them, what blocks them, and the kind of inner healing/balance that suits them.

Synthesis rules:
- This is a SYNTHESIS, not a trait dump. Where the birth chart and the palm point the same way, say so naturally (e.g. "both your chart and your palm lean toward...").
- You may reference astrological/palmistry ideas in plain, friendly language (e.g. "a Saturn-like steadiness", "a strong heart line"), but keep jargon light and always explain what it means in human terms.
- Be specific and psychologically realistic. Avoid generic statements that fit everyone.
- Use confident but non-absolute language; do not claim certainty where there is none.
- Do NOT make medical diagnoses, legal, financial, or lifespan predictions.
- Do not narrate or "identify" the photo; use it only as character inspiration.
- Write the entire response in ${language}.`;

  const userContent = [{ type: 'text', text: 'Generate the condensed Self & Constitution reading.' }];
  if (imageUrl) {
    userContent.push({ type: 'image_url', image_url: { url: imageUrl, detail: 'low' } });
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: 1100,
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
}

/**
 * Produce a short 3–4 point personality read from the user's intake answers.
 * Shown right after the intake summary is confirmed/clarified, before the user
 * picks a consultation path. Returns 3–4 short *bold*-headed WhatsApp bullets.
 *
 * @param {Object} details - { name, gender, concern, realize, affect, severity, language }
 * @returns {Promise<string>} - 3–4 bullet personality read
 */
async function personalitySummary(details) {
  const client = getClient();
  const language = languageName(details.language);

  const systemPrompt = `You are a warm, perceptive personality guide. From a person's intake answers, distil a short, uplifting personality read.

Person's intake:
- Name: ${details.name || ''}
- Gender: ${details.gender || ''}
- What's going on: ${details.concern || ''}
- When it became real: ${details.realize || ''}
- Most affected area: ${details.affect || ''}
- Sense of control: ${details.severity || ''}

Write EXACTLY 3–4 bullet points about who this person is as a personality (their temperament, inner strengths, how they cope, and one gentle blind spot). Rules:
- Each bullet: a short *bold* 2–4 word label, then one warm, specific sentence. Never more than one sentence per bullet.
- Speak TO the person ("you tend to…"). Be encouraging and psychologically realistic, never generic.
- No medical, diagnostic, or lifespan claims. No preamble, no closing line — only the bullets.
- Use a "•" at the start of each bullet.
- Write the entire response in ${language}.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Write the 3–4 point personality read.' },
    ],
    max_tokens: 400,
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

const REVIEW_SYSTEM_PROMPT = `You are a classical homeopathic case analyst. You synthesise a user's case history, their answers to targeted confirmation questions, and the constitutional tendencies inferred from an earlier astrology/palmistry reading, then reason through the classical homeopathic method layers to arrive at a ranked remedy shortlist.

CLASSICAL METHOD LAYERS (apply internally, in this order):
1) Hahnemann's pure classical: find the totality of characteristic symptoms; isolate the most individualising features.
2) Kent's constitutional/repertorial: prioritise mind, generals, and strong peculiar symptoms; rank by importance.
3) Boenninghausen: extract modalities, concomitants, sensations, location, extension, time, periodicity, aggravations/ameliorations.
4) Miasmatic (Ortega / Banerjea): infer the dominant miasm(s) — psora, sycosis, syphilis, tubercular, cancerinic, or mixed — and why.
5) Clinical/pragmatic: weigh practical remedy-fit from the overall pattern; note remedy families if relevant.
6) Farokh Master advanced classical: match remedy to BOTH constitution and pathology when possible.
7) Sehgal ROH: focus on objective, observable patterns, symptom order and direction.
8) Vijayakar predictive: consider inherited tendencies and susceptibility — use cautiously, as a probabilistic layer only.
9) Mangialavori complexity: check whether the case belongs to a remedy family/field rather than a single symptom list.
10) Boenninghausen-Boger / polar analysis: weigh opposites, polarities, and the general direction of change.

CONSTITUTIONAL LENS FROM ASTROLOGY/PALMISTRY (interpretive support only, NEVER proof):
The "Profile reading" context, when present, ends with a labeled "AstroVaidhya Personal Constitution Analysis" block containing 10 numbered sections: Your Core Nature, How Your Mind Works, Hidden Strengths, Biggest Challenges, What Drains Your Energy, What Gives You Energy, Communication Style, Relationship Nature, Life Lesson, Overall Personality Summary. Read these sections directly rather than re-deriving temperament from raw planet names:
- Your Core Nature + Overall Personality Summary → general constitutional type/temperament word to match against known remedy personalities.
- How Your Mind Works + Communication Style → mental generals (thinking pace, expressiveness, decisiveness) for Kent's mind/generals layer.
- Biggest Challenges + What Drains Your Energy → likely causation, aggravation triggers, and susceptibility direction.
- Hidden Strengths + What Gives Your Energy → ameliorations and coping resources — useful for confirming remedy fit, not for symptom selection.
- Relationship Nature + Life Lesson → longer-arc constitutional/miasmatic tendencies (e.g. recurring relational or duty-vs-freedom patterns), used cautiously as background, not diagnosis.
If the profile reading predates this template and has no such labeled sections, fall back to reading it as free-form constitutional narrative. Translate any of this into homeopathic temperament hypotheses ONLY where the actual answers agree. Keep a strict separation between observed data, inferred constitutional tendencies, remedy hypotheses, and confirmation still needed.

HARD RULES:
- Do not claim certainty. Do not confuse astrological symbolism with clinical proof.
- Prioritise the user's actual symptoms, modalities, mental state, generals, and causation over the astrology layer.
- Shortlist at most 3–5 remedies, ranked strongest to weakest. If nothing is strongly supported, say so plainly and lead with what to confirm.
- Use classical logic, not random remedy matching. Do not prescribe emergency treatment or replace a clinician; if red flags appear, advise urgent medical care.

OUTPUT — return a single JSON object with exactly these keys and nothing else:

{
  "message": "the text shown to the user and the care team",
  "medicines": [ { "name": "remedy name", "reason": "one-line reason it was chosen" } ]
}

Rules for "message" (shown to BOTH the user and the admin/care team):
1. Keep it warm and supportive but clinically honest. Aim for ~180–320 words.
2. Open by reflecting back what their answers indicate ("Based on what you've shared...").
3. Give a CONDENSED reasoning block in plain language: the constitutional picture, the likely dominant miasm (named simply), and the key symptoms/modalities that point toward the chosen remedies.
4. Briefly justify the ranked remedy shortlist (why the top remedy leads, what would confirm or change it).
5. State uncertainty honestly where it exists; do not over-claim.
6. Do not diagnose serious conditions; if any answer suggests a red flag, gently advise seeing a doctor.
7. Use short labelled lines or light *bold* headings so it reads cleanly on WhatsApp. No markdown tables.

Rules for "medicines":
1. List the ranked shortlist (up to 5), strongest first, each with a short one-line reason tied to the case.

Write all human-readable text ("message" and each "reason") in the requested output language.
Return ONLY the JSON object, with no surrounding text or markdown fences.`;

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
 * The question/answer pairs (plus the earlier astrology/palmistry reading as a
 * constitutional lens) are run through the classical homeopathic method layers
 * in REVIEW_SYSTEM_PROMPT. The model returns a warm-but-clinical summary with a
 * ranked remedy shortlist; the JSON is parsed into { message, medicines }.
 *
 * @param {Object} params
 * @param {string} params.category   - 'addiction' | 'mental' | 'sex'
 * @param {string[]} params.questions - Questions asked, in order
 * @param {string[]} params.answers   - User's answers, aligned with questions
 * @param {Object} [params.user]     - { name, age, gender, ... } (optional context)
 * @param {string} [params.astrologyResult] - Earlier profile reading (optional context)
 * @param {string} [params.language] - 'en' | 'hi' (output language)
 * @returns {Promise<{ message: string, medicines: Array<{ name: string, reason: string }> }>}
 *   message    - user-facing text (may name the recommended remedies)
 *   medicines  - remedy suggestions, also surfaced to the user and stored for admin
 */
async function reviewAndPrescribe({ category, questions, answers, user, astrologyResult, satisfactionNote, language }) {
  const client = getClient();

  const label = reviewCategoryLabels[category] || category;
  const outputLanguage = languageName(language);

  const qaPairs = questions
    .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || '(no answer)'}`)
    .join('\n\n');

  const userBlocks = [];
  if (user || astrologyResult || satisfactionNote) {
    const ctx = [];
    if (user?.name) ctx.push(`Name: ${user.name}`);
    if (user?.age != null) ctx.push(`Age: ${user.age}`);
    if (user?.gender) ctx.push(`Gender: ${user.gender}`);
    if (astrologyResult) ctx.push(`Profile reading: ${astrologyResult}`);
    if (satisfactionNote) ctx.push(`User's note on the profile reading (what felt off / what they hoped for): ${satisfactionNote}`);
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

  return parseReviewResponse(response);
}

/**
 * Free-text variant of reviewAndPrescribe for the "Other / Something else"
 * category, where the user describes their concern in their own words instead
 * of answering a fixed questionnaire. The same classical-homeopathic prompt and
 * { message, medicines } JSON contract are used so the rest of the consult flow
 * (result display, payment, next-step actions) is identical.
 *
 * @param {Object} params
 * @param {string} params.problem - The user's free-text description of their concern.
 * @param {Object} [params.user]  - { name, age, gender } (optional context)
 * @param {string} [params.astrologyResult] - Earlier profile reading (optional context)
 * @param {string} [params.language] - 'en' | 'hi' (output language)
 * @returns {Promise<{ message: string, medicines: Array<{ name: string, reason: string }> }>}
 */
async function reviewFreeform({ problem, user, astrologyResult, satisfactionNote, language }) {
  const client = getClient();
  const outputLanguage = languageName(language);

  const userBlocks = [];
  if (user || astrologyResult || satisfactionNote) {
    const ctx = [];
    if (user?.name) ctx.push(`Name: ${user.name}`);
    if (user?.age != null) ctx.push(`Age: ${user.age}`);
    if (user?.gender) ctx.push(`Gender: ${user.gender}`);
    if (astrologyResult) ctx.push(`Profile reading: ${astrologyResult}`);
    if (satisfactionNote) ctx.push(`User's note on the profile reading (what felt off / what they hoped for): ${satisfactionNote}`);
    if (ctx.length) userBlocks.push(`Context:\n${ctx.join('\n')}`);
  }
  userBlocks.push(`Category: Other / general concern\n\nThe user described their concern in their own words:\n\n"${problem}"`);
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

  return parseReviewResponse(response);
}

/**
 * Parse a chat completion that follows the REVIEW_SYSTEM_PROMPT JSON contract
 * into { message, medicines }. Falls back to using the raw text as the message
 * if the model didn't return valid JSON, so the user experience stays safe.
 */
function parseReviewResponse(response) {
  const raw = response.choices[0].message.content.trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('[OpenAI] review JSON parse failed:', err.message);
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

module.exports = { analyseUser, astrologyReading, personalitySummary, recoverSynthesis, detectCategory, embedText, reviewAndPrescribe, reviewFreeform };
