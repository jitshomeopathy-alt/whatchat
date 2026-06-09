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
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    // ── Astrology / basic details ───────────────────────────────────────────
    dob: {
      type: String, // stored as the user typed it, e.g. "1990-05-21" or "21 May 1990"
      default: null,
    },
    raashi: {
      type: String, // moon sign / zodiac (raashi)
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
