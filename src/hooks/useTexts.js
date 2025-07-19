import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useTexts = (projectId) => {
  const [texts, setTexts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {    
    if (!projectId) return;

    const fetchText = async () => {
      setLoading(true);
      setError(null);

      try {
        // Query texts for this project
        const textsRef = collection(db, 'texts');
        const q = query(
          textsRef,
          where('projectId', '==', projectId)
        );

        const textsData = [];
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Include document ID with the data
          textsData.push({ id: doc.id, ...data });
        });        

        // Sort by updatedAt if available (client-side sorting)
        textsData.sort((a, b) => {
          if (!a.updatedAt) return 1;
          if (!b.updatedAt) return -1;

          const aTime = a.updatedAt.toDate ? a.updatedAt.toDate().getTime() : new Date(a.updatedAt).getTime();
          const bTime = b.updatedAt.toDate ? b.updatedAt.toDate().getTime() : new Date(b.updatedAt).getTime();

          return bTime - aTime; // Descending order (newest first)
        })
        
        setTexts(textsData)
      } catch (err) {
        setError('Document does not exist.');
        setTexts(null);
      } finally {
        setLoading(false);
      }
    };

    fetchText();
  }, [projectId]);

  return { texts, loading, error };
};
