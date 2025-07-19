import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export const useText = (textId) => {
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!textId) return;

    const fetchText = async () => {
      setLoading(true);
      setError(null);

      try {
        const textRef = doc(db, 'texts', textId);
        const textSnap = await getDoc(textRef);

        if (textSnap.exists()) {
          setText(textSnap.data());
        } else {
          setText(null);
          setError(new Error('Document does not exist.'));
        }
      } catch (err) {
        setError(err);
        setText(null);
      } finally {
        setLoading(false);
      }
    };

    fetchText();
  }, [textId]);

  return { text, loading, error };
};