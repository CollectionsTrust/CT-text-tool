import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import './ParentTextSelector.css';

const booleanSearch = (text, query) => {
  const terms = query.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  return terms.every(term => {
    if (term.startsWith('-')) {
      return !text.toLowerCase().includes(term.slice(1).toLowerCase());
    } else if (term.includes('OR')) {
      const [a, b] = term.split('OR').map(t => t.trim());
      return text.toLowerCase().includes(a.toLowerCase()) || text.toLowerCase().includes(b.toLowerCase());
    } else {
      return text.toLowerCase().includes(term.toLowerCase());
    }
  });
};

const ParentTextSelector = ({ projectId, parentText, setParentText }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [texts, setTexts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTexts = async () => {
      const textsRef = collection(db, 'texts');
      const q = query(textsRef, where('projectId', '==', projectId));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          textReferenceNumber: data.textReferenceNumber,
          textSnippet: data.text?.replace(/<[^>]*>?/gm, '').split(' ').slice(0, 15).join(' ') + '...',
        };
      });
      setTexts(results);
    };
    if (modalOpen) fetchTexts();
  }, [modalOpen, projectId]);

  const filteredTexts = texts.filter(t => booleanSearch(`${t.textReferenceNumber} ${t.textSnippet}`, searchTerm));

  return (
    <div className="parent-text-selector">
      <div className="parent-text-display">
        <input
          type="text"
          className="form-input readonly"
          value={parentText || ''}
          readOnly
          placeholder="Select parent text"
          onClick={() => setModalOpen(true)}
        />
        {parentText && (
          <button className="clear-btn" onClick={() => setParentText(null)}>✕</button>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Parent Text</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search (use AND, OR, - for Boolean search)"
                />
              </div>
              <div className="parent-texts-list">
                {filteredTexts.length > 0 ? (
                  <table className="parent-texts-table">
                    <thead>
                      <tr>
                        <th>Text Ref</th>
                        <th>Preview</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTexts.map(t => (
                        <tr key={t.id}>
                          <td>{t.textReferenceNumber}</td>
                          <td>{t.textSnippet}</td>
                          <td>
                            <button
                              className="select-btn"
                              onClick={() => {
                                setParentText(t.textReferenceNumber);
                                setModalOpen(false);
                              }}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-results">No matching texts found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentTextSelector;
