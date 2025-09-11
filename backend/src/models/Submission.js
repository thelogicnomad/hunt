import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    teamId: { type: Number, required: true, unique: true },
    answer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const Submission = mongoose.model('Submission', submissionSchema);
