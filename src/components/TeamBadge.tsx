interface TeamBadgeProps {
  teamId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', img: 'w-6 h-6' },
  sm: { box: 'w-8 h-8', img: 'w-8 h-8' },
  md: { box: 'w-10 h-10', img: 'w-10 h-10' },
  lg: { box: 'w-14 h-14', img: 'w-14 h-14' },
};

export function TeamBadge({ teamId, size = 'md', className = '' }: TeamBadgeProps) {
  const src = `/teams/${teamId}.png`;
  const { box, img } = SIZE_MAP[size];

  return (
    <div className={`${box} flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={src}
        alt={teamId}
        className={`${img} object-contain`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = '0.3';
        }}
      />
    </div>
  );
}
