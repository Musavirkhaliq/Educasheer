import React from 'react';

const CardGrid = ({ 
  children, 
  className = '',
  variant = 'default',
  gap = 'responsive',
  minCardWidth = '300px'
}) => {
  const variants = {
    default: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    compact: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    wide: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    ultraWide: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    autoFit: ''
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-5',
    lg: 'gap-6 sm:gap-7 lg:gap-8',
    xl: 'gap-8 sm:gap-10 lg:gap-12',
    responsive: 'gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10'
  };

  if (variant === 'autoFit') {
    return (
      <div 
        className={`grid ${gapClasses[gap]} ${className}`}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`grid ${variants[variant]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default CardGrid;