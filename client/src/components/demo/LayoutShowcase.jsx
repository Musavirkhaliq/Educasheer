import React, { useState } from 'react';
import { 
  EnhancedContainer, 
  ResponsiveGrid, 
  ContentSidebar, 
  CardGrid, 
  OptimizedLayout 
} from '../layout';
import { FaDesktop, FaTabletAlt, FaMobile, FaExpand, FaCompress } from 'react-icons/fa';

const LayoutShowcase = () => {
  const [currentLayout, setCurrentLayout] = useState('enhanced');
  const [showGrid, setShowGrid] = useState(true);

  // Sample data for demonstration
  const sampleCards = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    title: `Sample Card ${i + 1}`,
    description: 'This is a sample card to demonstrate the enhanced layout system.',
    category: ['Technology', 'Design', 'Business', 'Science'][i % 4]
  }));

  const layouts = {
    enhanced: {
      name: 'Enhanced Layout',
      description: 'Optimized for ultra-wide screens with better horizontal space utilization',
      component: (
        <OptimizedLayout
          title="Enhanced Layout Showcase"
          subtitle="Experience better horizontal space utilization on larger screens"
          showSidebar={true}
        >
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Responsive Card Grid</h3>
              <CardGrid variant="default" gap="responsive">
                {sampleCards.slice(0, 12).map(card => (
                  <div key={card.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">{card.title}</h4>
                    <p className="text-blue-700 text-sm mb-3">{card.description}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {card.category}
                    </span>
                  </div>
                ))}
              </CardGrid>
            </div>
          </div>
        </OptimizedLayout>
      )
    },
    ultraWide: {
      name: 'Ultra-Wide Layout',
      description: 'Maximizes screen real estate for 4K and ultra-wide monitors',
      component: (
        <EnhancedContainer maxWidth="11xl" padding="responsive">
          <div className="py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Ultra-Wide Layout</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Designed for maximum horizontal space utilization on large screens
              </p>
            </div>
            
            <CardGrid variant="ultraWide" gap="responsive">
              {sampleCards.map(card => (
                <div key={card.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2">{card.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{card.description}</p>
                  <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                    {card.category}
                  </span>
                </div>
              ))}
            </CardGrid>
          </div>
        </EnhancedContainer>
      )
    },
    autoFit: {
      name: 'Auto-Fit Layout',
      description: 'Automatically adjusts card size based on available space',
      component: (
        <EnhancedContainer maxWidth="10xl" padding="responsive">
          <div className="py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Auto-Fit Layout</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cards automatically resize to fill available horizontal space
              </p>
            </div>
            
            <CardGrid variant="autoFit" gap="responsive" minCardWidth="280px">
              {sampleCards.slice(0, 16).map(card => (
                <div key={card.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">{card.title}</h4>
                  <p className="text-purple-700 text-sm mb-3">{card.description}</p>
                  <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs">
                    {card.category}
                  </span>
                </div>
              ))}
            </CardGrid>
          </div>
        </EnhancedContainer>
      )
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout Controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <EnhancedContainer maxWidth="11xl" padding="responsive">
          <div className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Layout Showcase</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaDesktop className="text-blue-500" />
                  <span>Optimized for larger screens</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Layout Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Layout:</label>
                  <select
                    value={currentLayout}
                    onChange={(e) => setCurrentLayout(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(layouts).map(([key, layout]) => (
                      <option key={key} value={key}>{layout.name}</option>
                    ))}
                  </select>
                </div>

                {/* Grid Toggle */}
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showGrid 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showGrid ? <FaCompress /> : <FaExpand />}
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </button>
              </div>
            </div>

            {/* Layout Description */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>{layouts[currentLayout].name}:</strong> {layouts[currentLayout].description}
              </p>
            </div>
          </div>
        </EnhancedContainer>
      </div>

      {/* Grid Overlay */}
      {showGrid && (
        <div className="fixed inset-0 pointer-events-none z-20">
          <div className="h-full max-w-11xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20">
            <div className="h-full grid grid-cols-12 gap-4 opacity-20">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-red-500 h-full"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Layout Content */}
      <div className="relative">
        {layouts[currentLayout].component}
      </div>

      {/* Responsive Indicators */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <FaMobile className="text-gray-400" />
            <span className="block sm:hidden text-green-600 font-medium">Mobile</span>
            <span className="hidden sm:block text-gray-400">Mobile</span>
          </div>
          <div className="flex items-center gap-1">
            <FaTabletAlt className="text-gray-400" />
            <span className="hidden sm:block md:hidden text-green-600 font-medium">Tablet</span>
            <span className="block sm:hidden md:block text-gray-400">Tablet</span>
          </div>
          <div className="flex items-center gap-1">
            <FaDesktop className="text-gray-400" />
            <span className="hidden md:block text-green-600 font-medium">Desktop</span>
            <span className="block md:hidden text-gray-400">Desktop</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutShowcase;