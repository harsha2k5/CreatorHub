import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  iconOnly = false
}) => {
  const iconDimensions = {
    sm: { icon: 'w-4 h-4', text: 'text-sm font-bold' },
    md: { icon: 'w-4 h-4', text: 'text-base font-bold' },
    lg: { icon: 'w-5 h-5', text: 'text-xl font-bold' },
    xl: { icon: 'w-6 h-6', text: 'text-2xl font-black' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      {/* Pink Sparkles Icon */}
      <Sparkles className={`${iconDimensions.icon} text-pink transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`} />

      {/* Brand Name */}
      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={`font-heading tracking-tight text-white ${iconDimensions.text}`}
          >
            CreatorHub
          </span>

          {showTagline && (
            <span className="text-[10px] text-muted font-medium tracking-wide">
              Local Brand × Creator Marketplace
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
