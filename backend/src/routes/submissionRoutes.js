import express from 'express';
import { Submission } from '../models/Submission.js';
import { TEAMS, ANSWER } from '../constants/teams.js';
import { adminAuth } from '../middlewares/adminAuth.js';

const router = express.Router();

// Helper to validate
const validateSubmission = (teamId, answer) => {
  const valid = TEAMS.includes(teamId);
  if (!valid) return { valid: false };
  const isCorrect = answer.toLowerCase().trim() === ANSWER.toLowerCase();
  return { valid: true, isCorrect };
};

// POST /submit
router.post('/submit', async (req, res) => {
  const { teamId, answer } = req.body;
  if (typeof teamId !== 'number' || typeof answer !== 'string') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    // Check if team already answered correctly
    const alreadyCorrect = await Submission.findOne({ teamId, isCorrect: true });
    if (alreadyCorrect) {
      return res.status(409).json({ message: 'You have already answered correctly. Good luck in next rounds!' });
    }

    const { valid, isCorrect } = validateSubmission(teamId, answer);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid teamId' });
    }

    if (!isCorrect) {
      return res.json({ message: 'Incorrect answer, please try again.' });
    }

    // Save only correct submission
    await Submission.create({ teamId, answer, isCorrect: true });

    // Count correct teams BEFORE including this one
    const correctCountBefore = await Submission.countDocuments({ isCorrect: true }) - 1; // subtract because we just inserted

    const selected = correctCountBefore < 4;

    return res.json({
      message: selected
        ? 'Congratulations! You have been selected for the next rounds.'
        : 'Good job! Your answer is correct but selection slots are filled.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- Admin Routes ----

// GET /admin/submissions
router.get('/admin/submissions', adminAuth, async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: 1 });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /admin/reset
router.post('/admin/reset', adminAuth, async (req, res) => {
  try {
    await Submission.deleteMany({});
    res.json({ message: 'Database reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
