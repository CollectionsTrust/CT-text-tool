// File: src/components/ProjectSetup/hooks/useProjectForm.js

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const useProjectForm = (projectId) => {
  const [formData, setFormData] = useState({
    projectReferenceNumber: '',
    textNumberPrefix: 'TXT',
    projectTitle: '',
    projectOrganiser: '',
    projectStartDate: '',
    projectEndDate: '',
    projectNote: '',
    copyrightLicensor: '',
    usageLicence: '',
    projectType: '',
    projectVenue: '',
    creditLine: '',
    textAudience: '',
    rightsReferenceNumber: '',
    hasHierarchicalText: false,
    tracksTextStatus: false,
    wantsTextTags: false,
    doNotSaveAuthorNames: false,
    textStatuses: ['Draft', 'Approved'],
    textTags: []
  });

  const [assignedAuthors, setAssignedAuthors] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState(['English']);
  const [token, setToken] = useState('');
  const [originalToken, setOriginalToken] = useState(''); // Track original token
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // NEW: Check if there are texts with linked objects
  const checkForLinkedObjects = async () => {
    try {
      const textsRef = collection(db, 'texts');
      const q = query(textsRef, where('projectId', '==', projectId));
      const snapshot = await getDocs(q);
      
      const textsWithLinkedObjects = [];
      let totalLinkedObjects = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.linkedObjects && data.linkedObjects.length > 0) {
          textsWithLinkedObjects.push({
            id: doc.id,
            textReferenceNumber: data.textReferenceNumber,
            linkedObjectsCount: data.linkedObjects.length
          });
          totalLinkedObjects += data.linkedObjects.length;
        }
      });
      
      return {
        hasLinkedObjects: textsWithLinkedObjects.length > 0,
        totalTexts: snapshot.size,
        textsWithLinkedObjects: textsWithLinkedObjects.length,
        totalLinkedObjects,
        affectedTexts: textsWithLinkedObjects
      };
    } catch (err) {
      console.error('Error checking for linked objects:', err);
      return { hasLinkedObjects: false, totalTexts: 0, textsWithLinkedObjects: 0, totalLinkedObjects: 0, affectedTexts: [] };
    }
  };

  // NEW: Remove all linked objects from texts
  const removeAllLinkedObjects = async () => {
    try {
      const textsRef = collection(db, 'texts');
      const q = query(textsRef, where('projectId', '==', projectId));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      let updatedCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.linkedObjects && data.linkedObjects.length > 0) {
          const textRef = doc(db, 'texts', doc.id);
          batch.update(textRef, {
            linkedObjects: [],
            updatedAt: serverTimestamp()
          });
          updatedCount++;
        }
      });
      
      if (updatedCount > 0) {
        await batch.commit();
        console.log(`Removed linked objects from ${updatedCount} texts`);
      }
      
      return updatedCount;
    } catch (err) {
      console.error('Error removing linked objects:', err);
      throw new Error('Failed to clean up linked objects');
    }
  };

  // NEW: Validate token change and handle cleanup
  const validateAndHandleTokenChange = async (newToken) => {
    // If token hasn't changed, no validation needed
    if (newToken === originalToken) {
      return { canProceed: true };
    }

    // If no original token exists, allow the change
    if (!originalToken) {
      return { canProceed: true };
    }

    // Check for linked objects
    const linkCheck = await checkForLinkedObjects();
    
    if (linkCheck.hasLinkedObjects) {
      const message = `⚠️ MDS API Token Change Warning

You are about to change the MDS API token for this project.

Current situation:
• ${linkCheck.totalTexts} texts exist in this project
• ${linkCheck.textsWithLinkedObjects} texts have linked objects
• ${linkCheck.totalLinkedObjects} total object links will be removed

When you change the token:
✓ All texts will be preserved
✓ All linked objects will be automatically removed
✓ No orphaned object references will remain
✓ You can re-link objects after the token change

Do you want to proceed with changing the token and cleaning up object links?`;

      const userConfirmed = window.confirm(message);
      
      if (userConfirmed) {
        try {
          // Remove all linked objects before proceeding
          const updatedCount = await removeAllLinkedObjects();
          
          return {
            canProceed: true,
            cleanupPerformed: true,
            updatedTextsCount: updatedCount,
            linkedObjectsInfo: linkCheck
          };
        } catch (err) {
          throw new Error(`Failed to clean up linked objects: ${err.message}`);
        }
      } else {
        return {
          canProceed: false,
          userCancelled: true
        };
      }
    }

    // No linked objects, safe to proceed
    return { canProceed: true };
  };

  useEffect(() => {
    const loadLocalData = () => {
      const storedData = localStorage.getItem(`projectData_${projectId}`);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setFormData((prev) => ({ ...prev, ...parsed }));
        setSelectedLanguages(parsed.languages || ['English']);
        setToken(parsed.mdsApiToken || '');
        setOriginalToken(parsed.mdsApiToken || ''); // Store original token
      }
    };

    const loadProjectData = async () => {
      try {
        setLoading(true);
        
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          setFormData((prev) => ({
            ...prev,
            projectReferenceNumber: projectData.projectReferenceNumber || '',
            textNumberPrefix: projectData.textNumberPrefix || 'TXT',
            projectTitle: projectData.title || '',
            projectOrganiser: projectData.projectOrganiser || '',
            projectStartDate: projectData.projectStartDate || '',
            projectEndDate: projectData.projectEndDate || '',
            projectNote: projectData.description || '',
            copyrightLicensor: projectData.copyrightLicensor || '',
            usageLicence: projectData.usageLicence || '',
            projectType: projectData.projectType || '',
            projectVenue: projectData.projectVenue || '',
            creditLine: projectData.creditLine || '',
            textAudience: projectData.textAudience || '',
            rightsReferenceNumber: projectData.rightsReferenceNumber || '',
            hasHierarchicalText: projectData.hasHierarchicalText || false,
            tracksTextStatus: projectData.tracksTextStatus || false,
            wantsTextTags: projectData.wantsTextTags || false,
            doNotSaveAuthorNames: projectData.doNotSaveAuthorNames || false,
            textStatuses: projectData.textStatuses || ['Draft', 'Approved'],
            textTags: projectData.textTags || []
          }));
          
          setSelectedLanguages(projectData.languages || ['English']);
          setToken(projectData.mdsApiToken || '');
          setOriginalToken(projectData.mdsApiToken || ''); // Store original token
        }
        
        // Try to load initial data from projectRequests if available
        const requestRef = doc(db, 'projectRequests', projectId);
        const requestSnap = await getDoc(requestRef);
        
        if (requestSnap.exists()) {
          const requestData = requestSnap.data();
          
          console.log("Project Request document fields:", Object.keys(requestData));
          console.log("Entire Project Request data:", requestData);
          
          const organizationValue = 
            requestData.organization || 
            requestData.Organisation || 
            requestData.organisation || 
            requestData.Organization || 
            requestData.org ||
            requestData.projectOrg ||
            requestData.projectOrganisation ||
            requestData.projectOrganizer ||
            requestData.organizer ||
            requestData.organiser ||
            '';
            
          console.log("Found organization value:", organizationValue);
          
          setFormData((prev) => {
            const updatedFormData = {...prev};
            
            if (!prev.projectTitle && requestData.projectTitle) {
              updatedFormData.projectTitle = requestData.projectTitle;
            }
            
            if (!prev.projectOrganiser && organizationValue) {
              updatedFormData.projectOrganiser = organizationValue;
            }
            
            if (!prev.projectNote && requestData.projectDescription) {
              updatedFormData.projectNote = requestData.projectDescription;
            }
            
            return updatedFormData;
          });
        }
        
        await loadAssignedAuthors();
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    
    const loadAssignedAuthors = async () => {
      try {
        const usersRef = collection(db, 'projectUsers');
        const userSnapshot = await getDocs(usersRef);
        
        const authors = [];
        
        userSnapshot.forEach(userDoc => {
          const userData = userDoc.data();
          const projectRoles = userData.projectRoles || {};
          
          if (projectRoles[projectId]) {
            if (projectRoles[projectId] === 'owner') {
              authors.push({
                id: userDoc.id,
                name: userData.name || userData.email,
                email: userData.email,
                role: 'owner'
              });
            } 
            else if (projectRoles[projectId] === 'author') {
              authors.push({
                id: userDoc.id,
                name: userData.name || userData.email,
                email: userData.email,
                role: 'author'
              });
            }
          }
        });
        
        setAssignedAuthors(authors);
        console.log("Loaded authors:", authors);
      } catch (err) {
        console.error('Error loading assigned authors:', err);
      }
    };

    loadLocalData();
    loadProjectData();
  }, [projectId]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // UPDATED: Save project with token validation
  const saveProjectToFirestore = async () => {
    setSaveSuccess(false);
    try {
      // Validate token change before saving
      const tokenValidation = await validateAndHandleTokenChange(token);
      
      if (!tokenValidation.canProceed) {
        if (tokenValidation.userCancelled) {
          return { success: false, cancelled: true };
        }
        throw new Error('Token change validation failed');
      }

      const projectRef = doc(db, 'projects', projectId);
      const authorNames = assignedAuthors.map(author => author.name);

      const updatePayload = {
        projectReferenceNumber: formData.projectReferenceNumber,
        textNumberPrefix: formData.textNumberPrefix,
        title: formData.projectTitle,
        projectOrganiser: formData.projectOrganiser,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate,
        description: formData.projectNote,
        authors: authorNames,
        languages: selectedLanguages,
        copyrightLicensor: formData.copyrightLicensor,
        usageLicence: formData.usageLicence,
        projectType: formData.projectType,
        projectVenue: formData.projectVenue,
        creditLine: formData.creditLine,
        textAudience: formData.textAudience,
        rightsReferenceNumber: formData.rightsReferenceNumber,
        mdsApiToken: token,
        hasHierarchicalText: formData.hasHierarchicalText || false,
        tracksTextStatus: formData.tracksTextStatus || false,
        wantsTextTags: formData.wantsTextTags || false,
        doNotSaveAuthorNames: formData.doNotSaveAuthorNames || false,
        textStatuses: formData.textStatuses || ['Draft', 'Approved'],
        textTags: formData.textTags || [],
        updatedAt: serverTimestamp(),
        setupComplete: true
      };

      await updateDoc(projectRef, updatePayload);
      
      // Save to localStorage
      localStorage.setItem(`projectData_${projectId}`, JSON.stringify({
        ...formData,
        languages: selectedLanguages,
        mdsApiToken: token
      }));
      
      localStorage.setItem(`mdsApiToken_${projectId}`, token);
      
      // Update original token after successful save
      setOriginalToken(token);
      
      setSaveSuccess(true);
      
      // Show success message with cleanup info if applicable
      if (tokenValidation.cleanupPerformed) {
        const cleanupMessage = `Project saved successfully!\n\nToken updated and ${tokenValidation.updatedTextsCount} texts had their object links removed to prevent orphaned references.`;
        alert(cleanupMessage);
      }
      
      return { 
        success: true, 
        cleanupPerformed: tokenValidation.cleanupPerformed,
        updatedTextsCount: tokenValidation.updatedTextsCount 
      };
    } catch (err) {
      console.error('Error saving project to Firestore:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    formData,
    setFormData,
    handleFieldChange,
    assignedAuthors,
    selectedLanguages,
    setSelectedLanguages,
    token,
    setToken,
    saveProjectToFirestore,
    loading,
    error,
    saveSuccess,
    setSaveSuccess,
    // NEW: Expose the validation function for external use if needed
    checkForLinkedObjects
  };
};
