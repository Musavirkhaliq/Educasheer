import React from 'react';

const EnhancedContainer = ({ 
  children, 
  className = '', 
  maxWidth = '11xl',
  padding = 'responsive',
  sidebar = null,
  sidebarPosition = 'right',
  sidebarWidth = 'lg'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    xl: 'px-12',
    responsive: 'px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20'
  };

  const sidebarWidthClasses = {
    sm: 'w-64',
    md: 'w-72',
    lg: 'w-80',
    xl: 'w-96'
  };

  const maxWidthClasses = {
    '7xl': 'max-w-7xl',
    '8xl': 'max-w-8xl',
    '9xl': 'max-w-9xl',
    '10xl': 'max-w-10xl',
    '11xl': 'max-w-11xl',
    'full': 'max-w-full'
  };

  if (sidebar) {
    // Use predefined grid classes from Tailwind config
    const gridClasses = {
      left: {
        sm: 'lg:grid-cols-sidebar-sm-left',
        md: 'lg:grid-cols-sidebar-md-left', 
        lg: 'lg:grid-cols-sidebar-lg-left',
        xl: 'lg:grid-cols-sidebar-xl-left'
      },
      right: {
        sm: 'lg:grid-cols-sidebar-sm-right',
        md: 'lg:grid-cols-sidebar-md-right',
        lg: 'lg:grid-cols-sidebar-lg-right',
        xl: 'lg:grid-cols-sidebar-xl-right'
      }
    };

    return (
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]} ${className}`}>
        <div className={`grid gap-6 lg:gap-8 xl:gap-12 ${gridClasses[sidebarPosition][sidebarWidth]}`}>
          {sidebarPosition === 'left' && (
            <aside className="hidden lg:block">
              {sidebar}
            </aside>
          )}
          <main className="min-w-0">
            {children}
          </main>
          {sidebarPosition === 'right' && (
            <aside className="hidden lg:block">
              {sidebar}
            </aside>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default EnhancedContainer;