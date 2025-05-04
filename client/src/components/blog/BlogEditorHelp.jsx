import React from 'react';

// A component to show help for HTML formatting
const BlogEditorHelp = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">HTML Formatting Guide</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <p>You can use these HTML tags to format your blog content:</p>
            
            <div className="border-t border-b border-gray-200 py-4">
              <h3 className="font-bold mb-2">Headings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">&lt;h1&gt;Main Heading&lt;/h1&gt;</code>
                </div>
                <div className="p-3">
                  <h1 className="text-2xl font-bold">Main Heading</h1>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">&lt;h2&gt;Subheading&lt;/h2&gt;</code>
                </div>
                <div className="p-3">
                  <h2 className="text-xl font-bold">Subheading</h2>
                </div>
              </div>
            </div>
            
            <div className="border-b border-gray-200 py-4">
              <h3 className="font-bold mb-2">Text Formatting</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">&lt;p&gt;Paragraph text&lt;/p&gt;</code>
                </div>
                <div className="p-3">
                  <p>Paragraph text</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">&lt;strong&gt;Bold text&lt;/strong&gt;</code>
                </div>
                <div className="p-3">
                  <strong>Bold text</strong>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">&lt;em&gt;Italic text&lt;/em&gt;</code>
                </div>
                <div className="p-3">
                  <em>Italic text</em>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">&lt;u&gt;Underlined text&lt;/u&gt;</code>
                </div>
                <div className="p-3">
                  <u>Underlined text</u>
                </div>
              </div>
            </div>
            
            <div className="border-b border-gray-200 py-4">
              <h3 className="font-bold mb-2">Lists</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">
                    &lt;ul&gt;<br />
                    &nbsp;&nbsp;&lt;li&gt;Item 1&lt;/li&gt;<br />
                    &nbsp;&nbsp;&lt;li&gt;Item 2&lt;/li&gt;<br />
                    &lt;/ul&gt;
                  </code>
                </div>
                <div className="p-3">
                  <ul className="list-disc pl-5">
                    <li>Item 1</li>
                    <li>Item 2</li>
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">
                    &lt;ol&gt;<br />
                    &nbsp;&nbsp;&lt;li&gt;First item&lt;/li&gt;<br />
                    &nbsp;&nbsp;&lt;li&gt;Second item&lt;/li&gt;<br />
                    &lt;/ol&gt;
                  </code>
                </div>
                <div className="p-3">
                  <ol className="list-decimal pl-5">
                    <li>First item</li>
                    <li>Second item</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="border-b border-gray-200 py-4">
              <h3 className="font-bold mb-2">Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">
                    &lt;a href="https://example.com"&gt;Link text&lt;/a&gt;
                  </code>
                </div>
                <div className="p-3">
                  <a href="#" className="text-blue-500 hover:underline">Link text</a>
                </div>
              </div>
            </div>
            
            <div className="border-b border-gray-200 py-4">
              <h3 className="font-bold mb-2">Images</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-pink-600">
                    &lt;img src="image-url.jpg" alt="Image description" /&gt;
                  </code>
                </div>
                <div className="p-3">
                  <p>This will display an image from the specified URL.</p>
                </div>
              </div>
            </div>
            
            <div className="py-4">
              <h3 className="font-bold mb-2">Example Blog Post</h3>
              
              <div className="bg-gray-50 p-3 rounded">
                <code className="text-sm text-pink-600 whitespace-pre-line">
                  &lt;h1&gt;My Blog Post Title&lt;/h1&gt;
                  
                  &lt;p&gt;This is an introduction paragraph for my blog post. It provides a brief overview of what the post will cover.&lt;/p&gt;
                  
                  &lt;h2&gt;First Section&lt;/h2&gt;
                  
                  &lt;p&gt;This is the content of the first section. I can include &lt;strong&gt;bold text&lt;/strong&gt; and &lt;em&gt;italic text&lt;/em&gt; for emphasis.&lt;/p&gt;
                  
                  &lt;ul&gt;
                    &lt;li&gt;Point one&lt;/li&gt;
                    &lt;li&gt;Point two&lt;/li&gt;
                    &lt;li&gt;Point three&lt;/li&gt;
                  &lt;/ul&gt;
                  
                  &lt;h2&gt;Second Section&lt;/h2&gt;
                  
                  &lt;p&gt;Here's more content with a &lt;a href="https://example.com"&gt;link to an example website&lt;/a&gt;.&lt;/p&gt;
                </code>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#00bcd4] text-white px-4 py-2 rounded hover:bg-[#01427a] transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditorHelp;
