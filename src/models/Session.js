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
        'READY_CONFIRM', // 7 intro messages sent, awaiting "Are you ready?" yes/no
        'PURPOSE_SELECT', // intro shown, awaiting "consult a doctor" vs "explore" choice
        'REGISTERING_NAME',
        'REGISTERING_GENDER',
        // ── Concern intake ────────────────────────────────────────────────
        'CONCERN_SELECT', // awaiting concern option tap (9-option list)
        'CONCERN_OTHER', // "In my words" chosen, awaiting free-text concern
        'CONCERN_REALIZE', // awaiting free-text "when did you first realise"
        'CONCERN_AFFECT', // awaiting "what has this affected most" tap
        'CONCERN_SEVERITY', // awaiting sense-of-control tap
        'SUMMARY_CONFIRM', // summary shown, awaiting "did I understand correctly" yes/no
        // ── Path selection + astro details ────────────────────────────────
        'PATH_SELECT', // awaiting "Clinical" vs "Astro + Clinical" tap
        'ASTRO_PALM', // awaiting palm photo
        'ASTRO_KUNDLI', // awaiting kundli photo/pdf
        'ASTRO_DOB', // awaiting date of birth
        'ASTRO_BIRTH_TIME', // awaiting birth time
        'ASTRO_BIRTH_PLACE', // awaiting place of birth (city/town — geocoded to lat/long, district, state)
        'PAYMENT_PENDING', // doctor/expert joined, awaiting ₹399 payment
        'MEDICAL_Q', // paid; collecting the medical questionnaire before handoff
        'DOCTOR_INTAKE', // paid (direct "Consult a doctor" path); fixed clinical questionnaire before handoff
        'SHIFTED', // paid; conversation handed off to the expert's number — terminal
        // ── Legacy (kept for back-compat) ─────────────────────────────────
        'REGISTERING_AGE',
        'REGISTERING_EMAIL',
        'REGISTERING_IMAGE',
        'REGISTERING_DOB',
        'REGISTERING_BIRTH_TIME',
        'REGISTERING_RAASHI',
        'REGISTERING_ADDRESS',
        'REGISTERED',
        'ASTRO_SATISFACTION',
        'ASTRO_FEEDBACK',
        'CATEGORY_SELECT',
        'CONSULT_OTHER',
        'CONSULT_Q',
        'CONSULT_ACTION',
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
    // Snapshot of the user's gender for the current consult — used to route the
    // adaptive sexual-wellness question set without reloading the user.
    gender: {
      type: String,
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
