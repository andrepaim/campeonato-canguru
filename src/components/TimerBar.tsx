import { useEffect, useState } from 'react';

interface TimerBarProps {
  duration: number;
  onTimeout: () => void;
  paused?: boolean;
}

export default function TimerBar({ duration, onTimeout, paused = false }: TimerBarProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (paused) return;

    if (remaining <= 0) {
      onTimeout();
      return;
    }

    const interval = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(interval);
  }, [remaining, paused, onTimeout]);

  const percentage = (remaining / duration) * 100;

  const getColor = () => {
    if (remaining > 6) return 'bg-green-500';
    if (remaining > 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
      <div
        className={`h-full transition-all duration-100 ${getColor()}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
