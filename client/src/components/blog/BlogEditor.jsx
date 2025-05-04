import React, { useState, useEffect } from 'react';
import BlogEditorHelp from './BlogEditorHelp';

// Simple rich text editor component using a textarea instead of contentEditable
// This approach avoids text direction issues
const BlogEditor = ({ initialContent = '', onChange }) => {
  const [content, setContent] = useState(initialContent);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Editor toolbar */}
      <div className="bg-gray-50 p-2 border-b border-gray-300 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">HTML Editor</h3>
        <button
          type="button"
          onClick={toggleHelp}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Formatting Help
        </button>
      </div>

      {/* Simple textarea editor */}
      <textarea
        value={content}
        onChange={handleChange}
        className="w-full min-h-[400px] p-4 focus:outline-none border-none resize-y"
        placeholder="Write your blog content here using HTML tags for formatting..."
        dir="ltr"
      />

      {/* Help text */}
      <div className="bg-gray-50 p-2 text-xs text-gray-500 border-t border-gray-300 flex justify-between items-center">
        <div>
          <p>Use HTML tags for formatting. Click "Formatting Help" for a complete guide.</p>
        </div>
        <button
          type="button"
          onClick={toggleHelp}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          Show Help
        </button>
      </div>

      {/* Help modal */}
      {showHelp && <BlogEditorHelp onClose={toggleHelp} />}
    </div>
  );
};

export default BlogEditor;
