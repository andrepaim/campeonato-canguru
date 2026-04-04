import { useState, useEffect } from 'react';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: 'A' | 'B' | 'C' | 'D' | 'E') => void;
  onSkip: () => void;
  disabled: boolean;
}

const OPTION_LETTERS: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

export default function QuestionCard({ question, onAnswer, onSkip, disabled }: QuestionCardProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  const openLightbox = () => {
    // Push a history entry so back gesture closes lightbox instead of navigating away
    window.history.pushState({ lightbox: true }, '');
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (showLightbox) {
        e.preventDefault();
        closeLightbox();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showLightbox]);

  // Both the inline thumbnail and the lightbox use the self-hosted page image.
  // Individual question crop images no longer exist since the self-hosting refactor.
  const pageImageUrl = question.pageFile ? `/pages/${question.pageFile}` : null;

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      {/* Question Text */}
      <p className="text-white text-lg mb-4 leading-relaxed">{question.questionText}</p>

      {/* Question Image (if hasImage) */}
      {question.hasImage && pageImageUrl && (
        <div className="mb-4">
          <img
            src={pageImageUrl}
            alt="Imagem da questão"
            className="w-full max-w-md mx-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={openLightbox}
          />
          <p className="text-xs text-gray-500 text-center mt-2">Toque para ampliar</p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2 mb-4">
        {OPTION_LETTERS.map((letter, index) => (
          <button
            key={letter}
            onClick={() => onAnswer(letter)}
            disabled={disabled}
            className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all ${
              disabled
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700 active:scale-98'
            }`}
          >
            <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm">
              {letter}
            </span>
            <span>{question.options[index]}</span>
          </button>
        ))}
      </div>

      {/* Skip Button */}
      <button
        onClick={onSkip}
        disabled={disabled}
        className={`w-full py-2 rounded-lg text-sm transition-all ${
          disabled
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
      >
        Pular questão
      </button>

      {/* Lightbox */}
      {showLightbox && pageImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            onClick={closeLightbox}
          >
            ✕
          </button>
          <img
            src={pageImageUrl}
            alt="Página completa"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
