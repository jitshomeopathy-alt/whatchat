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
        'REGISTERING_NAME',
        'REGISTERING_AGE',
        'REGISTERING_GENDER',
        'REGISTERING_EMAIL',
        'REGISTERING_IMAGE',
        'REGISTERED',
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
