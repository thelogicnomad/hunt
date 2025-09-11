import { connectDB } from '../../src/utils/db.js';
import { Submission } from '../../src/models/Submission.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  await connectDB();
  await Submission.deleteMany({});
  res.json({ message: 'Database reset successful' });
}
