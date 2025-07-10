import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export const useProject = (projectId) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(projectRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject({
            title: data.title || 'Project',
            reference: data.projectReferenceNumber || '',
            owner: data.owner || '',
            mdsApiToken: data.mdsApiToken
          });
        } else {
          setProject({});
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
};
