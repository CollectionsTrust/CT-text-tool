import { useEffect, useState } from 'react';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import QuillEditor from '../QuillEditor/QuillEditor';
import ParentTextSelector from './ParentTextSelector';
import './TextForm.css';

const TextForm = ({
  projectId,
  projectReferenceNumber,
  textId, // No textId means it's on the create text page
  onSave,
  onCancel,
  projectConfig,
  linkedObjects = [],
  onTextChange,
}) => {
  const [formKey, setFormKey] = useState(Date.now());
  const [textReferenceNumber, setTextReferenceNumber] = useState('');
  const [textAuthors, setTextAuthors] = useState([]);
  const [textLanguages, setTextLanguages] = useState([]);
  const [textDate, setTextDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [textStatus, setTextStatus] = useState('');
  const [textNote, setTextNote] = useState('');
  const [text, setText] = useState('');
  const [parentText, setParentText] = useState(null);
  const [textTag, setTextTag] = useState('');
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [originalValues, setOriginalValues] = useState(null);

  // IMPORTANT: Revert to original default values
  const {
    hasHierarchicalText = false,
    tracksTextStatus = false,
    wantsTextTags = false,
    textStatuses = ['Draft', 'Approved'],
    textTags = [],
    authors = [],
    languages = [],
    textNumberPrefix = 'TXT',
  } = projectConfig || {};

  // Clear dirty state on mount and unmount
  useEffect(() => {
    window.textFormIsDirty = false;
    return () => {
      window.textFormIsDirty = false;
    };
  }, []);

  // Track dirty state when form values change
  useEffect(() => {
    const currentValues = {
      text,
      textNote,
      textAuthors,
      textLanguages,
      textTag,
    };
    if (originalValues) {
      const dirty = JSON.stringify(currentValues) !== JSON.stringify(originalValues);
      window.textFormIsDirty = dirty;
      if (onTextChange) {
        onTextChange(dirty);
      }
    }
  }, [text, textNote, textAuthors, textLanguages, textTag, originalValues, onTextChange]);

  // Initialize text status when config loads or changes
  useEffect(() => {
    if (tracksTextStatus && textStatuses.length > 0 && !textStatus) {
      setTextStatus(textStatuses[0]);
    }
  }, [tracksTextStatus, textStatuses, textStatus]);

  const generateNextReferenceNumber = async () => {
    const textsRef = collection(db, 'texts');
    const q = query(textsRef, where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    const count = snapshot.size + 1;
    const padded = String(count).padStart(5, '0');
    setTextReferenceNumber(`${textNumberPrefix}${padded}`);
  };

  // IMPORTANT: Keep the original text data loading logic that was working correctly
  useEffect(() => {
    const loadTextData = async () => {
      if (textId) { // If editing a text instead of creating a new one
        try {
          const textRef = doc(db, 'texts', textId);
          const textSnap = await getDoc(textRef);

          if (textSnap.exists()) {
            const textData = textSnap.data();
            setTextReferenceNumber(textData.textReferenceNumber || '');
            setTextAuthors(textData.textAuthors || []);
            setTextLanguages(textData.textLanguages || []);
            setTextDate(textData.textDate || new Date().toISOString().substring(0, 10));
            setTextStatus(textData.textStatus || '');
            setTextNote(textData.textNote || '');
            setText(textData.text || '');
            setParentText(textData.parentText || null);
            setTextTag(textData.textTag || '');
            setOriginalValues({
              text: textData.text || '',
              textNote: textData.textNote || '',
              textAuthors: textData.textAuthors || [],
              textLanguages: textData.textLanguages || [],
              textTag: textData.textTag || ''
            });
            window.textFormIsDirty = false;
          }
        } catch (err) {
          console.error('Error loading text data:', err);
          setSaveError('Failed to load text data.');
        }
      } else {
        // Reset all form fields when creating a new text
        setText('');
        setTextNote('');
        setTextDate(new Date().toISOString().substring(0, 10));
        setParentText(null);
        setTextTag('');
        
        generateNextReferenceNumber();
        
        // IMPORTANT: This is the critical initialization logic
        // Only initialize with the first value if there's exactly ONE option
        if (authors.length === 1) {
          setTextAuthors([authors[0]]);
        } else {
          setTextAuthors([])
        };
        
        if (languages.length === 1) {
          setTextLanguages([languages[0]]);
        } else {
          setTextLanguages([]);
        }
        
        if (tracksTextStatus && textStatuses.length > 0) {
          setTextStatus(textStatuses[0]);
        } else {
          setTextStatus('');
        }
        
        setOriginalValues({
          text: '',
          textNote: '',
          textAuthors: authors.length === 1 ? [authors[0]] : [],
          textLanguages: languages.length === 1 ? [languages[0]] : [],
          textTag: ''
        });
        window.textFormIsDirty = false;
      }
    };
    
    loadTextData();
  }, [textId, projectId, authors, languages, textNumberPrefix, tracksTextStatus, textStatuses, formKey]);

  // Handle adding an author directly from dropdown selection
  const handleAuthorChange = (e) => {
    const selectedAuthor = e.target.value;
    if (selectedAuthor && !textAuthors.includes(selectedAuthor)) {
      setTextAuthors([...textAuthors, selectedAuthor]);
      // Reset the select to the default option
      e.target.value = '';
    }
  };

  // Handle removing an author
  const handleRemoveAuthor = (author) => {
    setTextAuthors(textAuthors.filter(a => a !== author));
  };

  // Handle adding a language directly from dropdown selection
  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    if (selectedLanguage && !textLanguages.includes(selectedLanguage)) {
      setTextLanguages([...textLanguages, selectedLanguage]);
      // Reset the select to the default option
      e.target.value = '';
    }
  };

  // Handle removing a language
  const handleRemoveLanguage = (language) => {
    setTextLanguages(textLanguages.filter(l => l !== language));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    if (!textReferenceNumber || !text || textAuthors.length === 0 || textLanguages.length === 0) {
      setSaveError('Please fill out all required fields.');
      setIsSaving(false);
      return;
    }

    if (tracksTextStatus && !textStatus) {
      setSaveError('Please select a text status.');
      setIsSaving(false);
      return;
    }

    try {
      const textData = {
        projectId,
        projectReferenceNumber,
        textReferenceNumber,
        textAuthors,
        textLanguages,
        textDate,
        textStatus,
        textNote,
        text,
        parentText,
        ...(wantsTextTags ? { textTag } : {}),
        linkedObjects,
        updatedAt: serverTimestamp(),
      };

      if (textId) {
        await updateDoc(doc(db, 'texts', textId), textData);
      } else {
        textData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'texts'), textData);
        
        // If this was a new text, reset the form for the next entry
        setFormKey(Date.now());
        setText('');
        setTextNote('');
        setTextDate(new Date().toISOString().substring(0, 10));
        setParentText(null);
        setTextTag('');
        generateNextReferenceNumber();
        
        // Reinitialize with defaults
        if (authors.length === 1) {
          setTextAuthors([authors[0]]);
        } else {
          setTextAuthors([]);
        }
        
        if (languages.length === 1) {
          setTextLanguages([languages[0]]);
        } else {
          setTextLanguages([]);
        }
        
        if (tracksTextStatus && textStatuses.length > 0) {
          setTextStatus(textStatuses[0]);
        }
      }

      setSaveMessage('Text saved successfully!');
      window.textFormIsDirty = false;
      
      // Update original values after save
      setOriginalValues({
        text: textId ? text : '',
        textNote: textId ? textNote : '',
        textAuthors: textId ? [...textAuthors] : (authors.length === 1 ? [authors[0]] : []),
        textLanguages: textId ? [...textLanguages] : (languages.length === 1 ? [languages[0]] : []),
        textTag: textId ? textTag : ''
      });
      
      onSave(textData);
    } catch (err) {
      console.error('Save error:', err);
      setSaveError('Failed to save text.');
    } finally {
      setIsSaving(false);
    }
  };

  // This function handles both the "Close" button in edit mode and the "Cancel" button in create mode
  const handleCancel = () => {
    // Check for unsaved changes
    if (window.textFormIsDirty) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to leave without saving?');
      if (!confirm) return;
    }
    
    // Reset dirty state
    window.textFormIsDirty = false;
    
    // If in edit mode, redirect to texts page
    if (textId) {
      // Navigate to texts page directly
      window.location.href = `/projects/${projectId}/texts`;
    } else {
      // In create mode, just call onCancel
      onCancel();
    }
  };

  // if (window.textFormIsDirty) {
  //     const confirm = window.confirm('You have unsaved changes. Are you sure you want to create a new text?');
  //     if (!confirm) return;
  //   }
  
  // Handler for "New" button in edit mode
  // const handleNew = () => {
  //   if (window.textFormIsDirty) {
  //     const confirm = window.confirm('You have unsaved changes. Are you sure you want to create a new text?');
  //     if (!confirm) return;
  //   }
    
  //   // Reset dirty state
  //   window.textFormIsDirty = false;
    
  //   // Reset form for new text 
  //   setFormKey(Date.now());
  //   setText('');
  //   setTextNote('');
  //   setTextDate(new Date().toISOString().substring(0, 10));
  //   setParentText(null);
  //   setTextTag('');
  //   setIsEditMode(false);
    
  //   // Reset and regenerate reference number
  //   setTextReferenceNumber('');
  //   generateNextReferenceNumber();
    
  //   // Reinitialize with defaults
  //   if (authors.length === 1) setTextAuthors([authors[0]]);
  //   else setTextAuthors([]);
    
  //   if (languages.length === 1) setTextLanguages([languages[0]]);
  //   else setTextLanguages([]);
    
  //   if (tracksTextStatus && textStatuses.length > 0) {
  //     setTextStatus(textStatuses[0]);
  //   } else {
  //     setTextStatus('');
  //   }
    
  //   setOriginalValues({
  //     text: '',
  //     textNote: '',
  //     textAuthors: authors.length === 1 ? [authors[0]] : [],
  //     textLanguages: languages.length === 1 ? [languages[0]] : [],
  //     textTag: ''
  //   });
        
  //   // Redirect to objects page to start fresh
  //   window.location.href = `/projects/${projectId}/objects`;
  // };

  // @TODO can I make the create texts link in the nav just go to the blank version of this page?
  //   {isEditMode && (
  //   <button
  //     type="button"
  //     className="secondary-btn"
  //     onClick={handleNew}
  //   >
  //     New text
  //   </button>
  // )}

  return (
    <form key={formKey} onSubmit={handleSubmit} className="text-form">
      <div className="text-form-header">
        <h2>
          {textId ? 'Edit text' : 'Create new text'}
          {textReferenceNumber && <span className="text-reference"> - {textReferenceNumber}</span>}
        </h2>
      </div>

      <div className="form-group">
        <QuillEditor value={text} onChange={setText} />
      </div>

      {/* Only show Parent Text selector if hierarchical text is enabled */}
      {hasHierarchicalText && (
        <div className="form-group parent-text-group">
          <label>Parent Text</label>
          <ParentTextSelector 
            projectId={projectId}
            parentText={parentText}
            setParentText={setParentText}
          />
        </div>
      )}

      <div className="form-group">
        <label>Note</label>
        <input type="text" value={textNote} onChange={(e) => setTextNote(e.target.value)} />
      </div>

      {/* Authors field with pills - simplified selection */}
      <div className="form-group">
        <label>Authors</label>
        <select
          onChange={handleAuthorChange}
          className="form-select"
          defaultValue=""
        >
          <option value="">Select author</option>
          {authors.filter(author => !textAuthors.includes(author)).map(author => (
            <option key={author} value={author}>{author}</option>
          ))}
        </select>
        {textAuthors.length > 0 && (
          <div className="selected-items-container">
            <ul className="selected-items-list">
              {textAuthors.map((author) => (
                <li key={author} className="selected-item">
                  <span>{author}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveAuthor(author)}
                    className="remove-item-btn"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Languages field with pills - simplified selection */}
      <div className="form-group">
        <label>Languages</label>
        <select
          onChange={handleLanguageChange}
          className="form-select"
          defaultValue=""
        >
          <option value="">Select language</option>
          {languages.filter(language => !textLanguages.includes(language)).map(language => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
        {textLanguages.length > 0 && (
          <div className="selected-items-container">
            <ul className="selected-items-list">
              {textLanguages.map((language) => (
                <li key={language} className="selected-item">
                  <span>{language}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveLanguage(language)}
                    className="remove-item-btn"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tag field */}
      {wantsTextTags && (
        <div className="form-group">
          <label>Tag</label>
          <select
            value={textTag}
            onChange={(e) => setTextTag(e.target.value)}
            className="form-select"
          >
            <option value="">Select a tag</option>
            {textTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      )}

      {/* Status field */}
      {tracksTextStatus && (
        <div className="form-group">
          <label>Status</label>
          <select 
            value={textStatus} 
            onChange={(e) => setTextStatus(e.target.value)}
            className="form-select"
          >
            <option value="">Select status</option>
            {textStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="primary-btn" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="secondary-btn" onClick={handleCancel}>Cancel</button>
      </div>
      
      {saveMessage && <span className="success-message">{saveMessage}</span>}
      {saveError && <span className="error-message">{saveError}</span>}
    </form>
  );
};

export default TextForm;
