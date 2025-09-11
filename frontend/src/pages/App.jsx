import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import api from '../api';

export default function App() {
  const [teamId, setTeamId] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introStage, setIntroStage] = useState(0);
  const [resultState, setResultState] = useState(null); // 'success', 'error', or null
  const [fieldErrors, setFieldErrors] = useState({});
  
  const shouldReduceMotion = useReducedMotion();
  
  // Technical Riddle Question
  const question = "I execute code in browsers, born in 1995, and my name sounds like coffee. What am I?";

  // VR Entry Animation Sequence
  useEffect(() => {
    if (shouldReduceMotion) {
      setShowIntro(false);
      return;
    }

    const sequence = [
      { stage: 1, duration: 800 },
      { stage: 2, duration: 1200 },
      { stage: 3, duration: 1000 },
      { stage: 4, duration: 600 },
    ];

    let totalTime = 0;
    sequence.forEach(({ stage, duration }) => {
      setTimeout(() => setIntroStage(stage), totalTime);
      totalTime += duration;
    });

    setTimeout(() => setShowIntro(false), totalTime + 400);
  }, [shouldReduceMotion]);

  // FIXED: Proper validation function
  const validateForm = useCallback(() => {
    const errors = {};
    
    // Team ID validation
    if (!teamId) {
      errors.teamId = 'Team ID is required';
    } else if (!/^[0-9]{3}$/.test(teamId)) {
      errors.teamId = 'Team ID must be exactly 3 digits';
    }
    
    // Answer validation
    if (!answer.trim()) {
      errors.answer = 'Answer is required';
    } else if (answer.trim().length < 2) {
      errors.answer = 'Answer must be at least 2 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [teamId, answer]);

  const submit = useCallback(async (e) => {
    e.preventDefault();
    setMessage('');
    setResultState(null);
    
    // Client-side validation
    if (!validateForm()) {
      setResultState('error');
      setTimeout(() => setResultState(null), 1000);
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.post('/submit', {
        teamId: Number(teamId),
        answer: answer.trim(),
      });
      
      setMessage(res.data.message);
      
      // FIXED: Robust validation logic
      const responseMessage = res.data.message?.toLowerCase() || '';
      
      // Success conditions - only these should trigger success
      const successKeywords = [
        'congratulations',
        'selected',
        'qualified',
        'correct',
        'next round',
        'advance',
        'winner',
        'success',
        'well done',
        'excellent',
        'perfect'
      ];
      
      // Error conditions - these should trigger error
      const errorKeywords = [
        'incorrect',
        'wrong',
        'invalid',
        'failed',
        'error',
        'try again',
        'better luck',
        'not correct',
        'please try'
      ];
      
      // First check for explicit error keywords
      const hasErrorKeywords = errorKeywords.some(keyword => 
        responseMessage.includes(keyword)
      );
      
      // Then check for success keywords
      const hasSuccessKeywords = successKeywords.some(keyword => 
        responseMessage.includes(keyword)
      );
      
      if (hasErrorKeywords) {
        // Definitely an error
        setResultState('error');
        setTimeout(() => setResultState(null), 1200);
      } else if (hasSuccessKeywords) {
        // Definitely a success
        setResultState('success');
        setTimeout(() => {
          setResultState(null);
          setTeamId('');
          setAnswer('');
          setMessage('');
        }, 7000);
      } else {
        // Default to error if unclear
        setResultState('error');
        setTimeout(() => setResultState(null), 1200);
      }
      
    } catch (err) {
      setMessage(err.response?.data?.message || 'Connection error. Please try again.');
      setResultState('error');
      setTimeout(() => setResultState(null), 1200);
    } finally {
      setLoading(false);
    }
  }, [teamId, answer, validateForm]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <VRIntroAnimation key="intro" stage={introStage} />
        ) : (
          <MainInterface
            key="main"
            teamId={teamId}
            setTeamId={setTeamId}
            answer={answer}
            setAnswer={setAnswer}
            message={message}
            loading={loading}
            onSubmit={submit}
            question={question}
            resultState={resultState}
            fieldErrors={fieldErrors}
            validateForm={validateForm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced VR Intro Animation
const VRIntroAnimation = ({ stage }) => {
  const particles = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: i * 0.08,
    })), []
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black via-purple-900/40 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Digital Matrix Rain */}
      <AnimatePresence>
        {stage >= 1 && particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-gradient-to-b from-cyan-400 via-violet-500 to-transparent rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            initial={{ opacity: 0, scale: 0, y: -30 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0.3],
              y: [0, window.innerHeight + 100]
            }}
            transition={{
              duration: 3.5,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeIn",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Central Portal with Rings */}
      <AnimatePresence>
        {stage >= 2 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Concentric Rings */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute border-2 border-violet-500/40 rounded-full"
                style={{
                  width: `${120 + i * 60}px`,
                  height: `${120 + i * 60}px`,
                }}
                animate={{
                  rotate: i % 2 === 0 ? 360 : -360,
                  borderColor: [
                    'rgba(139, 92, 246, 0.4)',
                    'rgba(20, 184, 166, 0.6)',
                    'rgba(139, 92, 246, 0.4)',
                  ],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: { duration: 8 + i * 2, repeat: Infinity, ease: "linear" },
                  borderColor: { duration: 3, repeat: Infinity },
                  scale: { duration: 2, repeat: Infinity },
                }}
              />
            ))}
            
            {/* Central Core */}
            <motion.div
              className="w-28 h-28 md:w-36 md:h-36 bg-gradient-conic from-violet-600 via-cyan-500 to-violet-600 rounded-full opacity-80 relative"
              animate={{
                rotate: 360,
                scale: [1, 1.15, 1],
              }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.5, repeat: Infinity },
              }}
            >
              <motion.div
                className="absolute inset-4 bg-black/30 rounded-full"
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry Text */}
      <AnimatePresence>
        {stage >= 3 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <motion.h1
                className="text-2xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-4"
                style={{ fontFamily: 'Orbitron, monospace' }}
                animate={{
                  textShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.8)',
                    '0 0 30px rgba(20, 184, 166, 0.8)',
                    '0 0 20px rgba(139, 92, 246, 0.8)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ENTERING VR QUEST
              </motion.h1>
              
              <motion.div
                className="flex justify-center space-x-1 mb-3"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
              
              <motion.p
                className="text-violet-300 text-base font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                🔮 Initializing Neural Interface... 🔮
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// SUCCESS Animation (Green) - ONLY for correct answers
const SuccessAnimation = ({ message }) => {
  const [confetti, setConfetti] = useState([]);
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    // Confetti pieces
    const confettiPieces = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 6)],
      size: Math.random() * 6 + 3,
      delay: Math.random() * 1.5,
      rotation: Math.random() * 360,
    }));
    setConfetti(confettiPieces);

    // Fireworks
    const fireworksData = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 40,
      delay: i * 0.3,
    }));
    setFireworks(fireworksData);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Green Background Explosion */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600"
        initial={{ scale: 0, borderRadius: '50%' }}
        animate={{ scale: 2.5, borderRadius: '0%' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Pulsing Success Overlay */}
      <motion.div
        className="absolute inset-0 bg-green-300/30"
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.01, 1],
        }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />

      {/* Confetti Rain */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${piece.rotation}deg)`,
          }}
          animate={{
            y: [0, window.innerHeight + 150],
            rotate: [piece.rotation, piece.rotation + 720],
            x: [0, Math.sin(piece.id) * 100],
          }}
          transition={{
            duration: 3.5 + Math.random() * 1.5,
            delay: piece.delay,
            ease: "easeIn",
          }}
        />
      ))}

      {/* Fireworks */}
      {fireworks.map((firework) => (
        <motion.div
          key={firework.id}
          className="absolute"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 0] }}
          transition={{
            duration: 1.2,
            delay: firework.delay,
            ease: "easeOut",
          }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              animate={{
                x: Math.cos(i * 45 * Math.PI / 180) * 40,
                y: Math.sin(i * 45 * Math.PI / 180) * 40,
                opacity: [1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: firework.delay + 0.2,
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Success Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-lg"
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        {/* Trophy Celebration */}
        <motion.div
          className="mb-6"
          animate={{ 
            rotate: [0, 8, -8, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 0.8, repeat: 2 }}
        >
          <div className="text-8xl mb-3">🏆</div>
          <motion.div
            className="flex justify-center space-x-2 text-4xl"
            animate={{ 
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 0.6, repeat: 3, delay: 0.3 }}
          >
            <span>🎉</span>
            <span>✨</span>
            <span>🎊</span>
            <span>🌟</span>
            <span>🎯</span>
          </motion.div>
        </motion.div>

        {/* Success Title */}
        <motion.h1
          className="text-3xl md:text-5xl font-black text-white mb-5 tracking-wider"
          style={{ fontFamily: 'Orbitron, monospace' }}
          animate={{ 
            textShadow: [
              '0 0 25px rgba(255,255,255,0.9)',
              '0 0 45px rgba(255,255,255,1)',
              '0 0 25px rgba(255,255,255,0.9)',
            ],
            scale: [1, 1.03, 1],
          }}
          transition={{ 
            textShadow: { duration: 1.2, repeat: Infinity },
            scale: { duration: 2, repeat: Infinity }
          }}
        >
          🎊 CONGRATULATIONS! 🎊
        </motion.h1>

        {/* Message Card */}
        <motion.div
          className="bg-white/25 backdrop-blur-xl rounded-2xl p-6 mb-6 border-2 border-white/40 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.p
            className="text-lg md:text-xl font-bold text-white mb-3"
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {message}
          </motion.p>
          
          <motion.div
            className="text-base text-white/95 font-semibold"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            🚀 QUEST COMPLETED SUCCESSFULLY! 🚀
          </motion.div>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          className="flex justify-center space-x-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {['⭐', '💎', '🔥', '⚡', '👑', '🎖️'].map((badge, i) => (
            <motion.div
              key={i}
              className="text-3xl bg-white/20 rounded-full p-3 backdrop-blur-sm border border-white/30"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.2,
                repeatType: "reverse",
              }}
              whileHover={{ scale: 1.4 }}
            >
              {badge}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Corner Sparkles */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`absolute text-5xl ${
            i === 0 ? 'top-12 left-12' : 
            i === 1 ? 'top-12 right-12' : 
            i === 2 ? 'bottom-12 left-12' : 
            'bottom-12 right-12'
          }`}
          animate={{
            scale: [0, 1.3, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.2,
            delay: 1 + i * 0.3,
            repeat: 1,
          }}
        >
          ✨
        </motion.div>
      ))}
    </motion.div>
  );
};

// ERROR Animation (Red) - ONLY for wrong answers
const ErrorAnimation = ({ message }) => {
  const [glitchLines, setGlitchLines] = useState([]);

  useEffect(() => {
    const lines = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      width: Math.random() * 150 + 50,
      height: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.3,
    }));
    setGlitchLines(lines);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Red Background Flash */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"
        initial={{ scale: 0 }}
        animate={{ scale: 2.2 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      {/* Screen Shake Effect */}
      <motion.div
        className="absolute inset-0 bg-red-500/40"
        animate={{ 
          x: [0, -3, 3, -2, 2, 0],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ 
          x: { duration: 0.15, repeat: 4 },
          opacity: { duration: 0.5, repeat: 1 }
        }}
      />

      {/* Digital Glitch Lines */}
      {glitchLines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute bg-white/60"
          style={{
            width: `${line.width}px`,
            height: `${line.height}px`,
            left: `${line.x}%`,
            top: `${line.y}%`,
          }}
          animate={{
            x: [0, 25, -25, 0],
            opacity: [0, 1, 0],
            scaleX: [1, 1.8, 1],
          }}
          transition={{
            duration: 0.12,
            delay: line.delay,
            repeat: 4,
          }}
        />
      ))}

      {/* Error Content */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ scale: 0.8, rotateX: -15 }}
        animate={{ scale: 1, rotateX: 0 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
      >
        {/* Error Icons */}
        <motion.div
          className="mb-5"
          animate={{ 
            rotate: [0, -12, 12, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 0.4, repeat: 1 }}
        >
          <div className="text-7xl mb-2">❌</div>
          <motion.div
            className="flex justify-center space-x-2 text-3xl"
            animate={{ 
              y: [0, -8, 0],
            }}
            transition={{ duration: 0.25, repeat: 2 }}
          >
            <span>⚠️</span>
            <span>💥</span>
            <span>🚫</span>
          </motion.div>
        </motion.div>

        {/* Error Title */}
        <motion.h1
          className="text-2xl md:text-4xl font-black text-white mb-4 tracking-wide"
          style={{ fontFamily: 'Orbitron, monospace' }}
          animate={{ 
            textShadow: [
              '0 0 15px rgba(255,255,255,0.8)',
              '0 0 25px rgba(255,100,100,1)',
              '0 0 15px rgba(255,255,255,0.8)',
            ],
            x: [0, -1.5, 1.5, 0],
          }}
          transition={{ 
            textShadow: { duration: 0.8, repeat: Infinity },
            x: { duration: 0.1, repeat: 3 }
          }}
        >
          ⚡ INCORRECT ANSWER! ⚡
        </motion.h1>

        {/* Error Message */}
        <motion.div
          className="bg-black/40 backdrop-blur-lg rounded-xl p-5 mb-5 border-2 border-red-400/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.p
            className="text-base md:text-lg font-bold text-white mb-2"
            animate={{ 
              opacity: [0.8, 1, 0.8],
              y: [0, -1, 1, 0],
            }}
            transition={{ 
              opacity: { duration: 1.2, repeat: Infinity },
              y: { duration: 0.15, repeat: 2 }
            }}
          >
            {message || "Wrong Answer! Try Again!"}
          </motion.p>
          
          <motion.div
            className="text-white/90 text-sm font-semibold"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🔄 Think Again! You Can Do This! 💪
          </motion.div>
        </motion.div>

        {/* Recovery Icons */}
        <motion.div
          className="flex justify-center space-x-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {['🎯', '🧠', '💡', '🔍'].map((icon, i) => (
            <motion.div
              key={i}
              className="text-2xl bg-black/20 rounded-full p-2 backdrop-blur-sm"
              animate={{
                y: [0, -12, 0],
                rotate: [0, -45, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 0.8 + i * 0.1,
                repeat: Infinity,
                delay: i * 0.1,
                repeatType: "reverse",
              }}
            >
              {icon}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Lightning Effects */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className={`absolute text-4xl ${
            i === 0 ? 'top-20 left-1/4' : 'top-20 right-1/4'
          }`}
          animate={{
            scale: [0, 1.3, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 0.3,
            delay: 0.15 + i * 0.1,
          }}
        >
          ⚡
        </motion.div>
      ))}
    </motion.div>
  );
};

// Main Interface with Enhanced Form Validation
const MainInterface = ({ 
  teamId, setTeamId, answer, setAnswer, message, loading, onSubmit, question, resultState,
  fieldErrors, validateForm
}) => {
  const backgroundParticles = useMemo(() => 
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: i * 0.3,
    })), []
  );

  // Real-time validation
  const handleTeamIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setTeamId(value);
    if (fieldErrors.teamId && value.length === 3) {
      validateForm();
    }
  };

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
    if (fieldErrors.answer && e.target.value.trim().length >= 2) {
      validateForm();
    }
  };

  return (
    <motion.div
      className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-purple-900/50 to-black"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Result Animations */}
      <AnimatePresence>
        {resultState === 'success' && <SuccessAnimation message={message} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {resultState === 'error' && <ErrorAnimation message={message} />}
      </AnimatePresence>

      {/* Background Particles */}
      {backgroundParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-gradient-to-r from-violet-400/25 to-cyan-400/25 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [-12, 12, -12],
            x: [-6, 6, -6],
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3.5 + particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-16 left-12 w-14 h-14 border-2 border-violet-500/30 rotate-45"
        animate={{ 
          rotate: [45, 405, 45],
          borderColor: [
            'rgba(139, 92, 246, 0.3)',
            'rgba(20, 184, 166, 0.3)',
            'rgba(139, 92, 246, 0.3)'
          ],
          scale: [1, 1.08, 1],
        }}
        transition={{ 
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          borderColor: { duration: 3.5, repeat: Infinity },
          scale: { duration: 2.5, repeat: Infinity }
        }}
      />

      <motion.div
        className="absolute bottom-16 right-12 w-10 h-10 bg-gradient-to-br from-cyan-500/25 to-violet-500/25 rounded-full"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
          rotate: [0, 360],
        }}
        transition={{ 
          scale: { duration: 2.5, repeat: Infinity },
          opacity: { duration: 2, repeat: Infinity },
          rotate: { duration: 6, repeat: Infinity, ease: "linear" }
        }}
      />

      {/* Main Content Container */}
      <motion.div
        className="relative z-10 w-full max-w-lg mx-auto"
        initial={{ y: 35, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
      >
        <div className="bg-gradient-to-br from-black/85 via-purple-900/35 to-black/85 backdrop-blur-2xl rounded-3xl p-8 border border-violet-500/30 shadow-2xl relative overflow-hidden">
          
          {/* Animated Scan Line */}
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ y: [0, 340, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Header Section */}
          <motion.div 
            className="text-center mb-7"
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* VR Icon */}
            <motion.div
              className="mx-auto mb-5 w-18 h-18 bg-gradient-to-br from-violet-500 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center relative overflow-hidden"
              whileHover={{ scale: 1.08, rotate: 6 }}
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(139, 92, 246, 0.5)',
                  '0 0 30px rgba(20, 184, 166, 0.5)',
                  '0 0 20px rgba(139, 92, 246, 0.5)',
                ]
              }}
              transition={{ 
                boxShadow: { duration: 2.5, repeat: Infinity },
                hover: { type: "spring", stiffness: 300, damping: 25 }
              }}
            >
              <svg className="w-10 h-10 text-white z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19,7H18V6A1,1 0 0,0 17,5H7A1,1 0 0,0 6,6V7H5A3,3 0 0,0 2,10V16A3,3 0 0,0 5,19H19A3,3 0 0,0 22,16V10A3,3 0 0,0 19,7M8,7H16V17H8V7M20,16A1,1 0 0,1 19,17H18V9H19A1,1 0 0,1 20,10V16M4,16V10A1,1 0 0,1 5,9H6V17H5A1,1 0 0,1 4,16Z" />
              </svg>
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-xl"
                animate={{ 
                  opacity: [0.25, 0.45, 0.25],
                  scale: [1, 1.03, 1],
                }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
            </motion.div>
            
            {/* Title */}
            <motion.h1
              className="text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent tracking-wider mb-3"
              style={{ fontFamily: 'Orbitron, monospace' }}
              animate={{ 
                textShadow: [
                  '0 0 12px rgba(139, 92, 246, 0.6)',
                  '0 0 20px rgba(139, 92, 246, 0.8)',
                  '0 0 12px rgba(139, 92, 246, 0.6)',
                ]
              }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              AR/VR QUEST
            </motion.h1>
            
            {/* Status */}
            <motion.div
              className="text-violet-200 text-xs font-medium flex items-center justify-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.span 
                className="w-1.5 h-1.5 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span>TREASURE HUNT • ROUND 01 • LIVE</span>
              <motion.span 
                className="w-1.5 h-1.5 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
              />
            </motion.div>
          </motion.div>

          {/* Question Section */}
          <motion.div
            className="mb-6 p-4 bg-gradient-to-r from-violet-900/20 to-purple-900/20 rounded-xl border border-violet-500/20 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileHover={{ scale: 1.01 }}
          >
            <h2 className="text-cyan-300 text-sm font-bold mb-2 flex items-center">
              <motion.span 
                className="mr-2"
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                🧠
              </motion.span> 
              TECHNICAL RIDDLE
            </h2>
            <p className="text-white text-sm leading-relaxed font-medium">
              {question}
            </p>
            
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500"
              animate={{ width: ['0%', '100%', '0%'] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={onSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {/* Team ID Input */}
            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400 }}>
              <label className="block text-violet-300 text-sm font-semibold mb-2 tracking-wide flex items-center">
                <motion.span 
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full mr-2"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                TEAM ID
                <span className="ml-auto text-xs text-violet-400/60">3 DIGITS</span>
              </label>
              <motion.input
                type="text"
                className={`w-full px-4 py-3 rounded-xl border-2 bg-black/60 text-white text-base font-mono placeholder-violet-400/70 focus:outline-none transition-all duration-200 ${
                  fieldErrors.teamId 
                    ? 'border-red-500/70 focus:border-red-400 focus:shadow-lg focus:shadow-red-500/20' 
                    : 'border-violet-500/50 focus:border-violet-400 focus:shadow-lg focus:shadow-violet-500/20'
                }`}
                placeholder="Enter 3-digit Team ID"
                maxLength={3}
                value={teamId}
                onChange={handleTeamIdChange}
                whileFocus={{ 
                  scale: 1.01, 
                  boxShadow: fieldErrors.teamId 
                    ? "0 0 25px rgba(239, 68, 68, 0.3)" 
                    : "0 0 25px rgba(139, 92, 246, 0.3)"
                }}
              />
              <AnimatePresence>
                {fieldErrors.teamId && (
                  <motion.p
                    className="text-red-400 text-xs mt-1 font-medium"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    ⚠️ {fieldErrors.teamId}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Answer Input */}
            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400 }}>
              <label className="block text-cyan-300 text-sm font-semibold mb-2 tracking-wide flex items-center">
                <motion.span 
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
                />
                SOLUTION
                <span className="ml-auto text-xs text-cyan-400/60">SINGLE WORD</span>
              </label>
              <motion.input
                type="text"
                className={`w-full px-4 py-3 rounded-xl border-2 bg-black/60 text-white text-base placeholder-cyan-400/70 focus:outline-none transition-all duration-200 ${
                  fieldErrors.answer 
                    ? 'border-red-500/70 focus:border-red-400 focus:shadow-lg focus:shadow-red-500/20' 
                    : 'border-cyan-500/50 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20'
                }`}
                placeholder="Enter your answer here"
                value={answer}
                onChange={handleAnswerChange}
                whileFocus={{ 
                  scale: 1.01,
                  boxShadow: fieldErrors.answer 
                    ? "0 0 25px rgba(239, 68, 68, 0.3)" 
                    : "0 0 25px rgba(20, 184, 166, 0.3)"
                }}
              />
              <AnimatePresence>
                {fieldErrors.answer && (
                  <motion.p
                    className="text-red-400 text-xs mt-1 font-medium"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    ⚠️ {fieldErrors.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full py-3.5 font-bold text-base bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 text-white rounded-xl shadow-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              whileHover={{ 
                scale: loading ? 1 : 1.02,
                boxShadow: "0 0 35px rgba(139, 92, 246, 0.6)"
              }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              animate={loading ? { 
                background: [
                  'linear-gradient(90deg, #7c3aed, #9333ea, #14b8a6)',
                  'linear-gradient(90deg, #14b8a6, #7c3aed, #9333ea)',
                  'linear-gradient(90deg, #9333ea, #14b8a6, #7c3aed)'
                ]
              } : {}}
              transition={{ duration: 0.35, repeat: loading ? Infinity : 0, repeatType: "reverse" }}
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </motion.span>
                    PROCESSING QUEST...
                  </>
                ) : (
                  <>
                    <motion.span 
                      className="mr-2"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    >
                      🚀
                    </motion.span>
                    SUBMIT QUEST
                  </>
                )}
              </span>
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-800"
              />
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div
            className="mt-7 text-center text-violet-400/60 text-xs space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center">
                <motion.span 
                  className="w-1 h-1 bg-green-400 rounded-full mr-1"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                Secure
              </span>
              <span className="flex items-center">
                <motion.span 
                  className="w-1 h-1 bg-blue-400 rounded-full mr-1"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
                />
                Real-time
              </span>
              <span className="flex items-center">
                <motion.span 
                  className="w-1 h-1 bg-violet-400 rounded-full mr-1"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }}
                />
                Optimized
              </span>
            </div>
            
            <motion.div
              className="text-violet-500/40 text-xs"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              🔮 Powered by Quantum Intelligence 🔮
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
