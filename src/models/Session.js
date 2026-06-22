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
        'PURPOSE_SELECT', // intro shown, awaiting "consult a doctor" vs "explore" choice
        'REGISTERING_NAME',
        'REGISTERING_AGE',
        'REGISTERING_GENDER',
        'REGISTERING_EMAIL',
        'REGISTERING_IMAGE',
        'REGISTERING_DOB',
        'REGISTERING_BIRTH_TIME',
        'REGISTERING_RAASHI',
        'REGISTERING_ADDRESS',
        'REGISTERED',
        // ── New astrology → consult flow ──────────────────────────────────
        'ASTRO_SATISFACTION', // reading shown, awaiting 0-25/25-50/50-75/75-100 tap
        'ASTRO_FEEDBACK', // low rating given, awaiting free-text note
        'CATEGORY_SELECT', // awaiting category button tap
        'CONSULT_OTHER', // "Something else" chosen, awaiting free-text problem
        'CONSULT_Q', // answering category questions
        'PAYMENT_PENDING', // result shown, awaiting ₹399 payment before order/consult
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
      enum: ['addiction', 'mental', 'sex', 'other', null],
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
    satisfactionNote: {
      type: String, // free-text note captured after a low (0-25) rating
      default: null,
    },
    // ── Payment (Razorpay) ──────────────────────────────────────────────────
    paymentLinkId: {
      type: String, // Razorpay payment link id (plink_...), indexed for webhook lookup
      default: null,
      index: true,
    },
    paymentStatus: {
      type: String, // null | 'pending' | 'paid'
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
