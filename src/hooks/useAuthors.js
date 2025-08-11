import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  getDoc,
  getDocs,
  query,
  where,
  doc,
  documentId
} from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// Gets all authors for projects that the current user owns
const useAuthors = () => {
  const [authors, setAuthors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      setError(null);

      try {
        setLoading(true);

        const userDocRef = doc(db, 'projectUsers', user.email);        
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : null
        const userProjectRoles = userData?.projectRoles        

        // First get all projects owned by current user    
        const ownedProjectIds = Object.keys(userProjectRoles)
          .filter(key => userProjectRoles?.[key] === 'owner');

        if (ownedProjectIds.length === 0) {
          setAuthors([]);
          setLoading(false);
          return;
        }

        // Get all users
        const usersRef = collection(db, 'projectUsers');
        const usersSnapshot = await getDocs(usersRef);        

        // First get all projects owned by current user
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where(documentId(), 'in', ownedProjectIds));
        const projectsSnapshot = await getDocs(q);

        // Find users who are authors of the current user's projects
        const authorsData = [];

        for (const userDoc of usersSnapshot.docs) {          
          const userData = userDoc.data();
          const userProjects = userData.projectRoles || {};

          // Check if this user is an author on any of the owned projects
          const authorProjects = [];
          let isAuthorOnAnyProject = false;

          if (user.uid === userData.addedByUserUID) {
            isAuthorOnAnyProject = true;
          }          

          for (const projectId of ownedProjectIds) {            
            if (userProjects[projectId] === 'author') {
              isAuthorOnAnyProject = true;

              // Find project details
              const projectDoc = projectsSnapshot.docs.find(doc => doc.id === projectId);
              if (projectDoc) {
                authorProjects.push({
                  id: projectId,
                  title: projectDoc.data().title || 'Untitled Project'
                });
              }
            }
          }          

          // If user is an author on at least one of owner's projects, add them to the list
          if (isAuthorOnAnyProject) {
            authorsData.push({
              id: userDoc.id,
              email: userData.email,
              name: userData.name || '',
              organization: userData.organization || '',
              authorProjects: authorProjects,
              projectCount: authorProjects.length
            });
          }
        }

        setAuthors(authorsData);
      } catch (err) {
        setError('Failed to load authors.');
      } finally {
        setLoading(false);
      }
    }

    fetchAuthors()
  }, [user]);

  return { authors, loading, error };
}

export default useAuthors