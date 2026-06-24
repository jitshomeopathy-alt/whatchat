const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Rating out of 10, shown as stars on the website.
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    // Hide a story from the public page without deleting it.
    published: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model('Story', storySchema);
