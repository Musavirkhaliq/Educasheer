import React from 'react';
import EnhancedContainer from './EnhancedContainer';
import ContentSidebar from './ContentSidebar';
import ResponsiveGrid from './ResponsiveGrid';

const OptimizedLayout = ({ 
  children,
  title,
  subtitle,
  heroContent,
  showSidebar = true,
  sidebarContent = null,
  sidebarPosition = 'right',
  maxWidth = '11xl',
  className = '',
  heroClassName = '',
  contentClassName = ''
}) => {
  const defaultSidebar = sidebarContent || <ContentSidebar />;

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* Hero Section */}
      {(title || subtitle || heroContent) && (
        <div className={`bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white ${heroClassName}`}>
          <EnhancedContainer maxWidth={maxWidth} padding="responsive">
            <div className="py-8 sm:py-12 md:py-16 lg:py-20">
              {heroContent || (
                <div className="max-w-4xl">
                  {title && (
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 lg:mb-6">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-3xl leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          </EnhancedContainer>
        </div>
      )}

      {/* Main Content */}
      <EnhancedContainer 
        maxWidth={maxWidth}
        padding="responsive"
        sidebar={showSidebar ? defaultSidebar : null}
        sidebarPosition={sidebarPosition}
        sidebarWidth="lg"
        className={`py-6 sm:py-8 lg:py-12 ${contentClassName}`}
      >
        {children}
      </EnhancedContainer>
    </div>
  );
};

// Pre-configured layout variants
export const PageLayout = (props) => (
  <OptimizedLayout {...props} />
);

export const DashboardLayout = (props) => (
  <OptimizedLayout 
    {...props}
    showSidebar={false}
    maxWidth="11xl"
    className="bg-gray-50"
  />
);

export const ContentLayout = (props) => (
  <OptimizedLayout 
    {...props}
    showSidebar={true}
    sidebarPosition="right"
    maxWidth="11xl"
  />
);

export const WideLayout = (props) => (
  <OptimizedLayout 
    {...props}
    showSidebar={false}
    maxWidth="full"
    className="bg-white"
  />
);

export default OptimizedLayout;