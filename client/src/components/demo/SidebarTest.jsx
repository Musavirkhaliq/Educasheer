import React from 'react';
import { EnhancedContainer } from '../layout';
import ContentSidebar from '../layout/ContentSidebar';

const SidebarTest = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#01427a] to-[#00bcd4] text-white">
        <EnhancedContainer maxWidth="11xl" padding="responsive">
          <div className="py-12">
            <h1 className="text-4xl font-bold mb-4">Sidebar Layout Test</h1>
            <p className="text-xl text-white/80">
              Testing the sidebar positioning and exam dashboard functionality
            </p>
          </div>
        </EnhancedContainer>
      </div>

      {/* Main Content with Sidebar */}
      <EnhancedContainer 
        maxWidth="11xl" 
        padding="responsive"
        sidebar={<ContentSidebar />}
        sidebarPosition="right"
        sidebarWidth="lg"
        className="py-12"
      >
        <div className="space-y-8">
          {/* Test Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Main Content Area</h2>
            <p className="text-gray-600 mb-4">
              This is the main content area. The sidebar should appear on the right side on large screens (lg and above) 
              and be hidden on smaller screens.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Sample Card {i + 1}</h3>
                  <p className="text-gray-600 text-sm">
                    This is sample content to demonstrate the layout with the sidebar.
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Information */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Layout Information</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Sidebar Position:</strong> Right side</p>
              <p><strong>Sidebar Width:</strong> 320px (lg)</p>
              <p><strong>Visibility:</strong> Hidden on screens smaller than lg (1024px)</p>
              <p><strong>Content:</strong> Exam Dashboard with simplified navigation</p>
            </div>
          </div>

          {/* Responsive Indicators */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Screen Size</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full block sm:hidden"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full hidden sm:block"></div>
                <span className="block sm:hidden text-red-600 font-medium">Mobile (< 640px)</span>
                <span className="hidden sm:block text-gray-500">Mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full hidden sm:block md:hidden"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full block sm:hidden md:block"></div>
                <span className="hidden sm:block md:hidden text-red-600 font-medium">Tablet (640px - 768px)</span>
                <span className="block sm:hidden md:block text-gray-500">Tablet</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full hidden md:block lg:hidden"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full block md:hidden lg:block"></div>
                <span className="hidden md:block lg:hidden text-red-600 font-medium">Desktop (768px - 1024px)</span>
                <span className="block md:hidden lg:block text-gray-500">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full hidden lg:block"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full block lg:hidden"></div>
                <span className="hidden lg:block text-green-600 font-medium">Large Desktop (≥ 1024px) - Sidebar Visible</span>
                <span className="block lg:hidden text-gray-500">Large Desktop - Sidebar Hidden</span>
              </div>
            </div>
          </div>
        </div>
      </EnhancedContainer>
    </div>
  );
};

export default SidebarTest;