const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    whatsappId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 150,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
      lowercase: true,
    },
    email: {
      type: String, // collection paused for now — optional
      required: false,
      trim: true,
      lowercase: true,
      default: null,
    },
    imageUrl: {
      type: String, // palm photo
      default: null,
    },
    // Preferred language for questions and AI results: 'en' | 'hi'
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    // ── Astrology / basic details ───────────────────────────────────────────
    dob: {
      type: String, // normalized to dd-mm-yyyy
      default: null,
    },
    birthTime: {
      type: String, // normalized to 24-hour "HH:MM", or null if unknown
      default: null,
    },
    raashi: {
      type: String, // legacy — no longer collected
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('User', userSchema);
