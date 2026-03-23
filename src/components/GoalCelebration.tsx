import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GoalCelebrationProps {
  type: 'goal' | 'skip' | 'timeout' | 'wrong';
  goals: number;
  onComplete: () => void;
}

export default function GoalCelebration({ type, goals, onComplete }: GoalCelebrationProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timer = setTimeout(() => onCompleteRef.current(), 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  if (type === 'goal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-green-800 to-green-900"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-8xl mb-6"
        >
          ⚽
        </motion.div>
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-galo-gold mb-4"
        >
          GOOOL DO GALO!
        </motion.h1>
        <p className="text-white text-xl">
          Resposta correta! +{goals} {goals === 1 ? 'gol' : 'gols'}
        </p>
      </motion.div>
    );
  }

  if (type === 'timeout') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95"
      >
        <div className="text-6xl mb-6">⏱</div>
        <h1 className="text-2xl font-bold text-gray-400 mb-2">Tempo esgotado</h1>
        <p className="text-gray-500">Próxima questão...</p>
      </motion.div>
    );
  }

  if (type === 'skip') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95"
      >
        <div className="text-6xl mb-6">➡️</div>
        <h1 className="text-2xl font-bold text-gray-400 mb-2">Próxima questão</h1>
      </motion.div>
    );
  }

  // Wrong answer
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95"
    >
      <div className="text-6xl mb-6">❌</div>
      <h1 className="text-2xl font-bold text-red-400 mb-2">Resposta errada</h1>
      <p className="text-gray-500">Próxima questão...</p>
    </motion.div>
  );
}
