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
