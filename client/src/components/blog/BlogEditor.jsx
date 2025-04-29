import React, { useState, useEffect } from 'react';

// Simple rich text editor component
// In a real application, you might want to use a more robust solution like TinyMCE, CKEditor, or Quill
const BlogEditor = ({ initialContent = '', onChange }) => {
  const [content, setContent] = useState(initialContent);
  
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
  
  const handleBold = () => {
    document.execCommand('bold', false, null);
  };
  
  const handleItalic = () => {
    document.execCommand('italic', false, null);
  };
  
  const handleUnderline = () => {
    document.execCommand('underline', false, null);
  };
  
  const handleHeading = (level) => {
    document.execCommand('formatBlock', false, `h${level}`);
  };
  
  const handleList = (type) => {
    document.execCommand(type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList', false, null);
  };
  
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };
  
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <button
          type="button"
          onClick={handleBold}
          className="p-2 rounded hover:bg-gray-200"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-2 rounded hover:bg-gray-200"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          className="p-2 rounded hover:bg-gray-200"
          title="Underline"
        >
          <u>U</u>
        </button>
        <div className="border-r border-gray-300 mx-1 h-8"></div>
        <button
          type="button"
          onClick={() => handleHeading(2)}
          className="p-2 rounded hover:bg-gray-200"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => handleHeading(3)}
          className="p-2 rounded hover:bg-gray-200"
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => handleHeading(4)}
          className="p-2 rounded hover:bg-gray-200"
          title="Heading 4"
        >
          H4
        </button>
        <div className="border-r border-gray-300 mx-1 h-8"></div>
        <button
          type="button"
          onClick={() => handleList('unordered')}
          className="p-2 rounded hover:bg-gray-200"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => handleList('ordered')}
          className="p-2 rounded hover:bg-gray-200"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="border-r border-gray-300 mx-1 h-8"></div>
        <button
          type="button"
          onClick={handleLink}
          className="p-2 rounded hover:bg-gray-200"
          title="Insert Link"
        >
          Link
        </button>
      </div>
      
      {/* Editor */}
      <div
        contentEditable
        className="min-h-[400px] p-4 focus:outline-none"
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => handleChange({ target: { value: e.currentTarget.innerHTML } })}
      />
      
      {/* Hidden textarea to store HTML content */}
      <textarea
        value={content}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default BlogEditor;
