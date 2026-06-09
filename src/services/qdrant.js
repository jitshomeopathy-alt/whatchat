const { QdrantClient } = require('@qdrant/js-client-rest');
const { embedText } = require('./openai');

const COLLECTION_NAME = 'medicines';
const VECTOR_SIZE = 1536;

let _client = null;

function getClient() {
  if (!_client) {
    const url = process.env.QDRANT_URL || 'http://localhost:6333';
    const apiKey = process.env.QDRANT_API_KEY || undefined;

    _client = new QdrantClient({ url, apiKey });
  }
  return _client;
}

/**
 * Initialise the medicines collection in Qdrant.
 * Creates it if it doesn't exist.
 */
async function initCollection() {
  const client = getClient();

  try {
    const existing = await client.getCollections();
    const names = existing.collections.map((c) => c.name);

    if (names.includes(COLLECTION_NAME)) {
      console.log(`[Qdrant] Collection "${COLLECTION_NAME}" already exists.`);
      return;
    }

    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
      },
    });

    console.log(`[Qdrant] Collection "${COLLECTION_NAME}" created.`);
  } catch (err) {
    console.error('[Qdrant] initCollection error:', err.message);
    throw err;
  }
}

/**
 * Embed a medicine document and upsert it into Qdrant.
 * @param {Object} medicine - { qdrantId, name, description, category, tags, keynotes, source }
 */
async function upsertMedicine(medicine) {
  const client = getClient();

  const keynoteText = keynotesToText(medicine.keynotes);
  const textToEmbed =
    `${medicine.name}. ${medicine.description}. Tags: ${(medicine.tags || []).join(', ')}.` +
    (keynoteText ? ` ${keynoteText}` : '');
  const vector = await embedText(textToEmbed);

  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points: [
      {
        id: medicine.qdrantId,
        vector,
        payload: {
          name: medicine.name,
          description: medicine.description,
          category: medicine.category,
          tags: medicine.tags || [],
          keynotes: medicine.keynotes || null,
          source: medicine.source || '',
        },
      },
    ],
  });

  console.log(`[Qdrant] Upserted medicine: ${medicine.name} (id: ${medicine.qdrantId})`);
}

/**
 * Search for medicines semantically matching the given text.
 * @param {string} text  - Symptom summary or query text
 * @param {number} topK  - Number of results to return (default 5)
 * @returns {Promise<Array>} - Array of { id, score, payload }
 */
async function searchMedicines(text, topK = 5) {
  const client = getClient();

  const queryVector = await embedText(text);

  const results = await client.search(COLLECTION_NAME, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
    score_threshold: 0.3,
  });

  return results.map((r) => ({
    id: r.id,
    score: r.score,
    payload: r.payload,
  }));
}

/**
 * Delete a medicine from Qdrant by its qdrantId.
 * @param {string} qdrantId
 */
async function deleteMedicine(qdrantId) {
  const client = getClient();

  await client.delete(COLLECTION_NAME, {
    wait: true,
    points: [qdrantId],
  });

  console.log(`[Qdrant] Deleted medicine id: ${qdrantId}`);
}

/**
 * Flatten a keynotes object into a readable sentence so its vocabulary
 * (mental state, modalities, fears, sleep, food, triggers, etc.) is embedded
 * and matched against the recovery question/answer summary.
 * @param {Object|null} keynotes
 * @returns {string}
 */
function keynotesToText(keynotes) {
  if (!keynotes || typeof keynotes !== 'object') return '';

  const labels = {
    state: 'Dominant state',
    worse_from: 'Worse from',
    better_from: 'Better from',
    behavior: 'Behaviour under stress',
    fears: 'Fears',
    sleep: 'Sleep',
    food: 'Food desires/aversions',
    triggers: 'Triggers',
    constitution: 'Constitution when well',
    red_flags: 'Danger signs',
  };

  return Object.entries(keynotes)
    .filter(([, v]) => v && String(v).trim().length > 0)
    .map(([k, v]) => `${labels[k] || k}: ${v}.`)
    .join(' ');
}

module.exports = { initCollection, upsertMedicine, searchMedicines, deleteMedicine };
