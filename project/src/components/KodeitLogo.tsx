import React from 'react';

interface KodeitLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const KodeitLogo: React.FC<KodeitLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/KODEIT_Logo_2.png" 
        alt="KODEIT" 
        className={sizeClasses[size]}
        onError={(e) => {
          // Fallback to text logo if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden">
        <span className="font-bold text-2xl text-purple-600">KODEIT</span>
      </div>
    </div>
  );
};

export default KodeitLogo;