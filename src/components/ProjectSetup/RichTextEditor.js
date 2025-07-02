import { useRef, useEffect } from 'react';

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  
  // Set initial content and handle updates from parent
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      // Only update if content is different to avoid cursor jumping
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);
  
  // Improved formatting commands for the WYSIWYG editor
  const executeFormatCommand = (command) => {
    if (editorRef.current) {
      // Store the current selection
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      
      // Focus the editor first
      editorRef.current.focus();
      
      // If there was a previous selection, restore it
      if (range) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      // Execute the command
      document.execCommand(command, false, null);
      
      // Ensure we notify parent of changes
      if (onChange) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };
  
  // Toolbar component with buttons for text formatting
  const RichTextToolbar = () => (
    <div className="rich-text-toolbar">
      <button 
        type="button" 
        onClick={() => executeFormatCommand('bold')}
        className="toolbar-btn"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button 
        type="button" 
        onClick={() => executeFormatCommand('italic')}
        className="toolbar-btn"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button 
        type="button" 
        onClick={() => executeFormatCommand('underline')}
        className="toolbar-btn"
        title="Underline"
      >
        <u>U</u>
      </button>
      <button 
        type="button" 
        onClick={() => executeFormatCommand('insertUnorderedList')}
        className="toolbar-btn"
        title="Bullet List"
      >
        • List
      </button>
      <button 
        type="button" 
        onClick={() => executeFormatCommand('insertOrderedList')}
        className="toolbar-btn"
        title="Numbered List"
      >
        1. List
      </button>
    </div>
  );

  // Handle direct input without backwards typing issues
  const handleInput = () => {
    // Get content from ref and pass to parent
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="form-group">
      <RichTextToolbar />
      <div
        id="projectNote"
        ref={editorRef}
        className="wysiwyg-editor"
        contentEditable="true"
        onInput={handleInput}
        suppressContentEditableWarning={true}
        aria-required="true"
      />
    </div>
  );
};

export default RichTextEditor;
