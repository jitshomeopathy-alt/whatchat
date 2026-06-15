const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    whatsappId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      enum: [
        'IDLE',
        'REGISTERING_LANGUAGE',
        'REGISTERING_NAME',
        'REGISTERING_AGE',
        'REGISTERING_GENDER',
        'REGISTERING_EMAIL',
        'REGISTERING_IMAGE',
        'REGISTERING_DOB',
        'REGISTERING_RAASHI',
        'REGISTERING_ADDRESS',
        'REGISTERED',
        // ── New astrology → consult flow ──────────────────────────────────
        'ASTRO_SATISFACTION', // reading shown, awaiting 0-25/25-50/50-75/75-100 tap
        'CATEGORY_SELECT', // awaiting category button tap
        'CONSULT_Q', // answering category questions
        'CONSULT_ACTION', // review shown, awaiting order/consult tap
        // ── Legacy (kept for back-compat) ─────────────────────────────────
        'ANALYSE_PENDING',
        'ANALYSE_DONE',
        'RECOVER_CATEGORY_SELECT',
        'RECOVER_Q',
        'RECOVER_DONE',
      ],
      default: 'IDLE',
    },
    category: {
      type: String,
      enum: ['addiction', 'mental', 'sex', null],
      default: null,
    },
    // Preferred language for the current flow: 'en' | 'hi'
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    registrationBuffer: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    recoverAnswers: {
      type: [String],
      default: [],
    },
    currentQuestion: {
      type: Number,
      default: 0,
    },
    // ── Astrology → consult flow state ──────────────────────────────────────
    astrologyResult: {
      type: String,
      default: null,
    },
    satisfaction: {
      type: String, // one of '0-25', '25-50', '50-75', '75-100'
      default: null,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('Session', sessionSchema);
