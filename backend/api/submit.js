import { connectDB } from '../src/utils/db.js';
import { Submission } from '../src/models/Submission.js';
import { TEAMS } from '../src/constants/teams.js';

const validateSubmission = (teamId, answer) => {
  const valid = TEAMS.includes(teamId);
  if (!valid) return { valid: false };
  const correctAns = (process.env.ANSWER || process.env.ans || '').toLowerCase();
  const isCorrect = answer.toLowerCase().trim() === correctAns;
  return { valid: true, isCorrect };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { teamId, answer } = req.body;
  if (typeof teamId !== 'number' || typeof answer !== 'string') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  await connectDB();

  // already correct?
  const existingCorrect = await Submission.findOne({ teamId, isCorrect: true });
  if (existingCorrect) {
    return res.status(409).json({ message: 'You have already answered correctly.' });
  }

  const { valid, isCorrect } = validateSubmission(teamId, answer);
  if (!valid) return res.status(400).json({ message: 'Invalid teamId' });

  if (!isCorrect) {
    return res.json({ message: 'Incorrect answer, please try again.' });
  }

  await Submission.create({ teamId, answer, isCorrect: true });
  const correctBefore = (await Submission.countDocuments({ isCorrect: true })) - 1;
  const selected = correctBefore < 4;
  res.json({ message: selected ? 'Congratulations! You have been selected for the next rounds.' : 'Good job! Your answer is correct but selection slots are filled.' });
}
