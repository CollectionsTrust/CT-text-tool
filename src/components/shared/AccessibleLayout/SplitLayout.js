import { useState, useEffect, useRef } from 'react';

/**
 * SplitLayout component
 * Provides a resizable split layout with two panels separated by a draggable divider
 * Supports keyboard navigation and screen readers
 */
const SplitLayout = ({
  leftPanel,                       // Content for left panel
  rightPanel,                      // Content for right panel
  initialSplit = 60,               // Default split percentage (left panel width)
  minLeftWidth = 30,               // Minimum left panel width percentage
  maxLeftWidth = 70,               // Maximum left panel width percentage
  leftPanelLabel = 'Left panel',   // ARIA label for left panel
  rightPanelLabel = 'Right panel', // ARIA label for right panel
  handleAriaLabel = 'Resize panels. Use left and right arrow keys to adjust',
  onSplitChange                    // Optional callback when split position changes
}) => {
  // State for split position and dragging
  const [splitPosition, setSplitPosition] = useState(initialSplit);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for DOM elements
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const handleRef = useRef(null);
  
  // Handle mouse drag start
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    
    // Announce drag start to screen readers
    announceToScreenReader('Resize started. Use mouse or arrow keys to resize panels.');
  };

  // Handle mouse drag
  const handleDrag = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Calculate position as percentage
    let newPosition = (mouseX / containerWidth) * 100;
    
    // Constrain to min/max limits
    newPosition = Math.max(Math.min(newPosition, maxLeftWidth), minLeftWidth);
    
    setSplitPosition(newPosition);
    
    // Notify parent component if callback provided
    if (onSplitChange) {
      onSplitChange(newPosition);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Restore text selection
    document.body.style.userSelect = '';
    
    // Announce final position to screen readers
    announceToScreenReader(`Panels resized. Left panel is now ${Math.round(splitPosition)}%, right panel is ${Math.round(100 - splitPosition)}%`);
  };

  // Handle keyboard navigation for resizing
  const handleKeyboardResize = (e) => {
    // Only respond to left/right arrow keys
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      
      // Move in 5% increments
      const delta = e.key === 'ArrowLeft' ? -5 : 5;
      let newPosition = splitPosition + delta;
      
      // Constrain to min/max limits
      newPosition = Math.max(Math.min(newPosition, maxLeftWidth), minLeftWidth);
      
      setSplitPosition(newPosition);
      
      // Notify parent component if callback provided
      if (onSplitChange) {
        onSplitChange(newPosition);
      }
      
      // Announce new position to screen readers
      announceToScreenReader(`Panels resized. Left panel is now ${Math.round(newPosition)}%, right panel is ${Math.round(100 - newPosition)}%`);
    }
  };

  // Helper function to announce changes to screen readers
  const announceToScreenReader = (message) => {
    const liveRegion = document.getElementById('a11y-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  };

  // Add event listeners for mouse drag
  useEffect(() => {
    const handleMouseMove = (e) => handleDrag(e);
    const handleMouseUp = () => handleDragEnd();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Focus either panel programmatically
  const focusLeftPanel = () => {
    if (leftPanelRef.current) {
      leftPanelRef.current.focus();
    }
  };

  const focusRightPanel = () => {
    if (rightPanelRef.current) {
      rightPanelRef.current.focus();
    }
  };

  // Default keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+1 to focus left panel
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        focusLeftPanel();
        announceToScreenReader('Left panel focused');
      }
      
      // Ctrl+2 to focus right panel
      if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        focusRightPanel();
        announceToScreenReader('Right panel focused');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Custom split container style
  const splitContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    height: 'auto', // Changed from fixed height to auto
    minHeight: '500px', // Keep a minimum height
    position: 'relative',
    margin: '0', // Remove top/bottom margin
    borderRadius: '0 0 8px 8px', // Round only bottom corners
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    cursor: isDragging ? 'col-resize' : 'auto'
  };

  // Left panel style
  const leftPanelStyle = {
    width: `${splitPosition}%`,
    height: 'auto', // Changed from 100% to auto
    minHeight: '500px', // Ensure a minimum height
    overflowY: 'auto',
    padding: '1.5rem',
    position: 'relative',
    backgroundColor: 'white',
    borderRight: '1px solid #eee'
  };

  // Handle style
  const handleStyle = {
    width: '12px',
    height: '100%',
    cursor: 'col-resize',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    transition: 'background-color 0.2s'
  };

  // Handle line style
  const handleLineStyle = {
    width: '4px',
    height: '100px',
    backgroundColor: '#ccc',
    borderRadius: '2px',
    transition: 'background-color 0.2s'
  };

  // Right panel style
  const rightPanelStyle = {
    width: `${100 - splitPosition}%`,
    height: 'auto', // Changed from 100% to auto
    minHeight: '500px', // Ensure a minimum height
    overflowY: 'auto',
    padding: '1.5rem',
    position: 'relative',
    backgroundColor: '#fafafa'
  };

  return (
    <div 
      style={splitContainerStyle}
      ref={containerRef}
      className="split-layout-container"
    >
      {/* Left Panel */}
      <div 
        id="left-panel"
        style={leftPanelStyle}
        ref={leftPanelRef}
        tabIndex="-1"
        role="region"
        aria-label={leftPanelLabel}
        className="left-panel"
      >
        {leftPanel}
      </div>
      
      {/* Resize Handle */}
      <div 
        style={handleStyle}
        ref={handleRef}
        onMouseDown={handleDragStart}
        onKeyDown={handleKeyboardResize}
        tabIndex="0"
        role="separator"
        aria-valuenow={splitPosition}
        aria-valuemin={minLeftWidth}
        aria-valuemax={maxLeftWidth}
        aria-controls="left-panel right-panel"
        aria-orientation="vertical"
        aria-label={handleAriaLabel}
        className="split-handle"
      >
        <div style={handleLineStyle}></div>
      </div>
      
      {/* Right Panel */}
      <div 
        id="right-panel"
        style={rightPanelStyle}
        ref={rightPanelRef}
        tabIndex="-1"
        role="region"
        aria-label={rightPanelLabel}
        className="right-panel"
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default SplitLayout;
