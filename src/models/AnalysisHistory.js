const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    whatsappId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['analyse', 'recover'],
    },
    prompt: {
      type: String,
      required: true,
    },
    // Structured question/answer pairs from the questionnaire (for the admin view).
    qa: {
      type: [
        {
          question: String,
          answer: String,
        },
      ],
      default: [],
    },
    response: {
      type: String,
      required: true,
    },
    medicines: {
      type: [
        {
          name: String,
          description: String,
          reason: String,
          category: String,
          score: Number,
        },
      ],
      default: [],
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

module.exports = mongoose.model('AnalysisHistory', analysisHistorySchema);
