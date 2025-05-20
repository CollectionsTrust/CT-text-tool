import { useState, useEffect } from 'react';

const useAuthorSelection = (initialSelectedAuthors = []) => {
  const [authorInput, setAuthorInput] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState([]);

  // Initialize with the passed in selected authors
  useEffect(() => {
    setSelectedAuthors(initialSelectedAuthors);
  }, [initialSelectedAuthors]);

  // Author selection functions
  const handleAuthorInputChange = (e) => {
    setAuthorInput(e.target.value);
  };
  
  const handleAuthorSelection = () => {
    if (authorInput && authorInput.trim() !== '' && !selectedAuthors.includes(authorInput.trim())) {
      const updatedAuthors = [...selectedAuthors, authorInput.trim()];
      
      // Update localStorage directly
      localStorage.setItem('selectedAuthors', JSON.stringify(updatedAuthors));
      
      // Update state
      setSelectedAuthors(updatedAuthors);
      setAuthorInput(''); // Clear the input field
    }
  };
  
  const handlePredefinedAuthorSelection = (author) => {
    if (!selectedAuthors.includes(author)) {
      const updatedAuthors = [...selectedAuthors, author];
      
      // Update localStorage directly
      localStorage.setItem('selectedAuthors', JSON.stringify(updatedAuthors));
      
      // Update state
      setSelectedAuthors(updatedAuthors);
    }
  };
  
  const handleRemoveAuthor = (author) => {
    const updatedAuthors = selectedAuthors.filter(a => a !== author);
    
    // Update localStorage directly
    localStorage.setItem('selectedAuthors', JSON.stringify(updatedAuthors));
    
    // Update state
    setSelectedAuthors(updatedAuthors);
  };

  return {
    authorInput,
    selectedAuthors,
    handleAuthorInputChange,
    handleAuthorSelection,
    handlePredefinedAuthorSelection,
    handleRemoveAuthor
  };
};

export default useAuthorSelection;
