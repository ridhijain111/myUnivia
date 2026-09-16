import React from 'react';

interface UniviaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const UniviaLogo: React.FC<UniviaLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
  };

  const svgDimensions = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Simple, sleek, premium Univia geometric badge */}
      <div
        className={`${iconDimensions[size]} bg-[#7033F5] flex items-center justify-center text-white shadow-sm shadow-[#7033F5]/25 transition-transform duration-200 group-hover:scale-105 shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${svgDimensions[size]} text-white`}
        >
          {/* Simple, clean, iconic Univia U mark with forward momentum */}
          <path
            d="M5.5 5.5V13.5C5.5 17.0899 8.41015 20 12 20C15.5899 20 18.5 17.0899 18.5 13.5V5.5"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="11" r="2.2" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <span className="font-black text-lg sm:text-xl tracking-tight text-[#1E1730]">
              univia
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7033F5] ml-0.5 mt-2"></span>
          </div>
          <span className="text-[10px] font-semibold text-[#8C849E] tracking-wider uppercase -mt-1">
            Campus
          </span>
        </div>
      )}
    </div>
  );
};
