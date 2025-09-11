import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function AdminRoute() {
  const [secret, setSecret] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, qualified: 0 });
  const [showQualified, setShowQualified] = useState(false);
  const [qualifiedTeams, setQualifiedTeams] = useState([]);

  useEffect(() => {
    calculateStats();
  }, [submissions]);

  const calculateStats = () => {
    const total = submissions.length;
    const correct = submissions.filter(s => s.isCorrect).length;
    const qualified = Math.min(correct, 4); // Top 4 qualified
    setStats({ total, correct, qualified });
    setQualifiedTeams(submissions.filter(s => s.isCorrect).sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt)).slice(0,4));
  };

  const fetchSubs = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/admin/submissions', {
        headers: { 'x-admin-secret': secret },
      });
      setSubmissions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (!confirm('⚠️ This will permanently delete all submissions. Continue?')) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/admin/reset', {}, {
        headers: { 'x-admin-secret': secret },
      });
      setSubmissions([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        className="max-w-7xl mx-auto mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
                🛡️ ADMIN CONTROL CENTER
              </h1>
              <p className="text-violet-300">AR/VR Treasure Hunt • Round Management</p>
            </div>
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-2xl">⚙️</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Qualified Modal */}
      <AnimatePresence>
        {showQualified && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-yellow-400/30"
              initial={{ scale:0.8 }} animate={{ scale:1 }} exit={{ scale:0.8 }}>
              <h3 className="text-2xl font-bold text-yellow-300 mb-4 text-center">Top 4 Qualified Teams</h3>
              {qualifiedTeams.length ? (
                <ul className="space-y-3">
                  {qualifiedTeams.map((t,idx)=>(
                    <li key={t.teamId} className="bg-yellow-500/10 rounded-lg px-4 py-2 flex justify-between">
                      <span className="font-mono font-bold text-white">#{t.teamId}</span>
                      <span className="text-gray-300 text-sm">{new Date(t.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No qualified teams yet.</p>
              )}
              <button className="mt-6 w-full py-2 bg-yellow-600 rounded-lg" onClick={()=>setShowQualified(false)}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Control Panel */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/30 space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">🔑 Access Control</h2>
            
            {/* Secret Input */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <input
                type="password"
                className="w-full px-4 py-3 bg-black/60 border border-violet-500/50 rounded-xl text-white placeholder-violet-400 focus:outline-none focus:border-violet-400 focus:shadow-lg focus:shadow-violet-500/25"
                placeholder="Admin Secret Key"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </motion.div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={fetchSubs}
                disabled={!secret || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      ⚡
                    </motion.span>
                    Loading...
                  </>
                ) : (
                  '📊 Fetch Data'
                )}
              </motion.button>

              <motion.button
                className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={reset}
                disabled={!secret || loading}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(239, 68, 68, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                🗑️ Reset All
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="space-y-3 pt-4 border-t border-violet-500/20">
              <div className="bg-gradient-to-r from-blue-500/20 to-violet-500/20 p-3 rounded-lg border border-blue-400/30">
                <div className="text-blue-300 text-sm font-medium">Total Submissions</div>
                <motion.div 
                  className="text-2xl font-bold text-white"
                  key={stats.total}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {stats.total}
                </motion.div>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-lg border border-green-400/30">
                <div className="text-green-300 text-sm font-medium">Correct Answers</div>
                <motion.div 
                  className="text-2xl font-bold text-white"
                  key={stats.correct}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {stats.correct}
                </motion.div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 rounded-lg border border-yellow-400/30 cursor-pointer active:scale-95" onClick={() => setShowQualified(true)}>
                <div className="text-yellow-300 text-sm font-medium">Qualified Teams</div>
                <motion.div 
                  className="text-2xl font-bold text-white"
                  key={stats.qualified}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {stats.qualified}/4
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-violet-500/30 overflow-hidden">
            <div className="p-6 border-b border-violet-500/20">
              <h2 className="text-xl font-bold text-white">📋 Submissions Database</h2>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="m-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-red-300 font-medium text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            <div className="overflow-x-auto">
              {submissions.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-violet-900/30 border-b border-violet-500/20">
                      <th className="px-6 py-4 text-left text-violet-300 font-semibold">Team ID</th>
                      <th className="px-6 py-4 text-left text-violet-300 font-semibold">Answer</th>
                      <th className="px-6 py-4 text-center text-violet-300 font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-violet-300 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((submission, index) => (
                        <motion.tr
                          key={`${submission.teamId}-${submission.createdAt}`}
                          className={`border-b border-violet-500/10 hover:bg-violet-500/10 ${
                            submission.isCorrect ? 'bg-green-500/5' : ''
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="px-6 py-4 text-white font-mono font-bold">
                            #{submission.teamId}
                          </td>
                          <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                            {submission.answer}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <motion.span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                submission.isCorrect
                                  ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                                  : 'bg-red-500/20 text-red-300 border border-red-400/30'
                              }`}
                              whileHover={{ scale: 1.1 }}
                            >
                              {submission.isCorrect ? '✅ Correct' : '❌ Wrong'}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                            {new Date(submission.createdAt).toLocaleString()}
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <motion.div
                  className="p-12 text-center text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-lg font-medium">No submissions yet</p>
                  <p className="text-sm">Data will appear here once teams start submitting</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
