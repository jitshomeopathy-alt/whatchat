const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    qdrantId: {
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
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['physical', 'mental', 'chronic'],
    },
    tags: {
      type: [String],
      default: [],
    },
    keynotes: {
      // Structured repertory keynotes mirroring the recovery questions:
      // state, worse_from, better_from, behavior, fears, sleep, food,
      // triggers, constitution, red_flags. Used to match question answers.
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    source: {
      type: String,
      default: '',
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

module.exports = mongoose.model('Medicine', medicineSchema);
