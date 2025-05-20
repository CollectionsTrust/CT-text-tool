import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './QuillEditor.css';

const QuillEditor = ({ value, onChange }) => {
  const [editorHtml, setEditorHtml] = useState(value || '');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCodeView, setIsCodeView] = useState(false);
  const quillRef = useRef(null);
  const codeEditorRef = useRef(null);
  const initialContentRef = useRef(value || '');

  // Add useEffect to update editor content when value prop changes
  useEffect(() => {
    setEditorHtml(value || '');
    // Also update the initial content ref when value prop changes
    initialContentRef.current = value || '';
  }, [value]);
  
  // Set global dirty flag when content changes, but ONLY for text form
  useEffect(() => {
    if (editorHtml !== initialContentRef.current) {
      // Only set the flag if we're in the text form (Objects page)
      if (window.location.pathname.includes('/objects')) {
        window.textFormIsDirty = true;
      }
    } else {
      // If content is back to initial value, clear the dirty flag
      if (window.location.pathname.includes('/objects')) {
        window.textFormIsDirty = false;
      }
    }
  }, [editorHtml]);

  // Function to toggle between visual and code view
  const toggleCodeView = () => {
    if (isCodeView && codeEditorRef.current) {
      // Switching from code to visual - update the editor content
      setEditorHtml(codeEditorRef.current.value);
      if (onChange) {
        onChange(codeEditorRef.current.value);
      }
    }
    setIsCodeView(!isCodeView);
  };

  // Handle edits in code view
  const handleCodeChange = (e) => {
    // No need to update Quill in real-time, we'll do it on toggle
    // Just call onChange so parent components know content changed
    if (onChange) {
      onChange(e.target.value);
    }
    
    // Only set dirty flag on objects page
    if (window.location.pathname.includes('/objects')) {
      window.textFormIsDirty = true;
    }
  };

  const handleChange = (html) => {
    setEditorHtml(html);
    if (onChange) {
      onChange(html);
    }
    
    // Mark as dirty only if different from initial content
    if (html !== initialContentRef.current && window.location.pathname.includes('/objects')) {
      window.textFormIsDirty = true;
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Validate that the URL is a valid HTTPS URL
  const isValidHttpsUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  };

  // Function to handle image insertion via URL
  const handleImageUrlInsert = () => {
    const url = prompt('Enter the URL of the image (must be an https:// URL):');
    
    if (!url) return; // User cancelled
    
    // Validate URL - must be HTTPS
    if (!isValidHttpsUrl(url)) {
      alert('Please enter a valid HTTPS URL (starting with https://)');
      return;
    }
    
    try {
      // Only attempt to use the Quill API if we're in visual mode
      if (!isCodeView && quillRef.current) {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection() || { index: editor.getLength(), length: 0 };
        
        // Insert the image at the cursor position
        editor.insertEmbed(range.index, 'image', url);
        
        // Move cursor after the image
        editor.setSelection(range.index + 1);
      } else if (isCodeView && codeEditorRef.current) {
        // We're in code view, so let's just insert the image tag at the end
        const imgTag = `<img src="${url}" alt="Inserted image" />`;
        const textarea = codeEditorRef.current;
        const currentValue = textarea.value;
        
        // Insert at cursor position if available, otherwise at the end
        if (textarea.selectionStart || textarea.selectionStart === 0) {
          const startPos = textarea.selectionStart;
          const endPos = textarea.selectionEnd;
          
          textarea.value = currentValue.substring(0, startPos) + 
                          imgTag + 
                          currentValue.substring(endPos, currentValue.length);
          
          // Update the content
          if (onChange) {
            onChange(textarea.value);
          }
        } else {
          // No cursor position, append to the end
          textarea.value = currentValue + imgTag;
          if (onChange) {
            onChange(textarea.value);
          }
        }
      }
    } catch (error) {
      console.error('Error inserting image:', error);
      // Fallback method - just append the image tag to the end
      const imgTag = `<img src="${url}" alt="Inserted image" />`;
      const newHtml = editorHtml + imgTag;
      setEditorHtml(newHtml);
      if (onChange) {
        onChange(newHtml);
      }
    }
  };

  // Define the modules/formats you want to support
  // Removed 'image' from the toolbar container
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link'], // Removed 'image' from here
        [{ 'align': [] }],
        ['clean']
      ]
    }
  };

  // Still keep 'image' in formats so inserted images work properly
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'script',
    'indent',
    'link', 'image', // Keep image here for format support
    'align',
    'clean'
  ];

  return (
    <div className={`quill-editor-container ${isFullScreen ? 'fullscreen' : ''}`}>
      {isFullScreen && (
        <div className="fullscreen-controls">
          <button 
            type="button" 
            className="exit-fullscreen-btn"
            onClick={toggleFullScreen}
          >
            Exit full screen
          </button>
        </div>
      )}
      
      <div className="editor-wrapper">
        {isCodeView ? (
          <textarea
            ref={codeEditorRef}
            className="code-view-editor"
            value={editorHtml}
            onChange={handleCodeChange}
          />
        ) : (
          <ReactQuill 
            ref={quillRef}
            theme="snow"
            value={editorHtml}
            modules={modules}
            formats={formats}
            onChange={handleChange}
          />
        )}
      </div>
      
      <div className="editor-footer">
        <button 
          type="button" 
          className="code-view-btn"
          onClick={toggleCodeView}
          title={isCodeView ? "Switch to visual editor" : "Switch to HTML code view"}
        >
          {isCodeView ? "Visual editor" : "HTML code view"}
        </button>
        
        <button 
          type="button" 
          className="insert-image-url-btn"
          onClick={handleImageUrlInsert}
          title="Insert image from HTTPS URL"
          style={{ 
            marginLeft: '10px',
            fontSize: '14px',
            padding: '3px 10px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            background: '#f8f8f8',
            cursor: 'pointer'
          }}
        >
          Insert image from URL
        </button>
        
        {!isFullScreen && (
          <button 
            type="button" 
            className="fullscreen-btn"
            onClick={toggleFullScreen}
            title="Toggle Full Screen"
          >
            Full screen
          </button>
        )}
      </div>
    </div>
  );
};

export default QuillEditor;
