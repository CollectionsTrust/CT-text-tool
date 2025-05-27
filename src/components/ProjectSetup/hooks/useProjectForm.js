// File: src/components/ProjectSetup/hooks/useProjectForm.js

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const useProjectForm = (projectId) => {
  const [formData, setFormData] = useState({
    projectReferenceNumber: '',
    textNumberPrefix: 'TXT', // Default value
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
    // Text settings fields
    hasHierarchicalText: false,
    tracksTextStatus: false,
    wantsTextTags: false,
    doNotSaveAuthorNames: false, // New field for issue #7
    textStatuses: ['Draft', 'Approved'], // Default statuses
    textTags: []
  });

  const [assignedAuthors, setAssignedAuthors] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState(['English']); // Default to English
  const [token, setToken] = useState('');
  const [originalToken, setOriginalToken] = useState(''); // Track original token
  const [tokenLocked, setTokenLocked] = useState(false); // NEW: Track if token is locked
  const [linkedObjectsInfo, setLinkedObjectsInfo] = useState(null); // NEW: Store linked objects info
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

  // NEW: Custom setToken that checks for linked objects
  const handleTokenChange = async (newToken) => {
    // If token hasn't changed, just update
    if (newToken === originalToken) {
      setToken(newToken);
      return;
    }

    // If no original token, allow change (new project)
    if (!originalToken) {
      setToken(newToken);
      return;
    }

    // If user is trying to change an existing token, check for linked objects
    const linkCheck = await checkForLinkedObjects();
    
    if (linkCheck.hasLinkedObjects) {
      // Show error and revert token
      const message = `❌ Cannot Change API Token

This project has texts with linked objects:
• ${linkCheck.textsWithLinkedObjects} texts have linked objects
• ${linkCheck.totalLinkedObjects} total object links exist

To change the API token, you must first:
1. Go to the Objects page
2. Edit each text that has linked objects  
3. Remove all object links manually
4. Then return here to change the token

This prevents orphaned object references.`;

      alert(message);
      setToken(originalToken); // Revert to original
      return;
    }

    // No linked objects, allow change
    setToken(newToken);
  };

  useEffect(() => {
    const loadLocalData = () => {
      const storedData = localStorage.getItem(`projectData_${projectId}`);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setFormData((prev) => ({ ...prev, ...parsed }));
        setSelectedLanguages(parsed.languages || ['English']);
        const storedToken = parsed.mdsApiToken || '';
        setToken(storedToken);
        setOriginalToken(storedToken);
      }
    };

    const loadProjectData = async () => {
      try {
        setLoading(true);
        
        // Load project data from Firestore
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
            // Load text settings data
            hasHierarchicalText: projectData.hasHierarchicalText || false,
            tracksTextStatus: projectData.tracksTextStatus || false,
            wantsTextTags: projectData.wantsTextTags || false,
            doNotSaveAuthorNames: projectData.doNotSaveAuthorNames || false, // Load new field
            textStatuses: projectData.textStatuses || ['Draft', 'Approved'],
            textTags: projectData.textTags || []
          }));
          
          setSelectedLanguages(projectData.languages || ['English']);
          const projectToken = projectData.mdsApiToken || '';
          setToken(projectToken);
          setOriginalToken(projectToken);
        }
        
        // Try to load initial data from projectRequests if available
        const requestRef = doc(db, 'projectRequests', projectId);
        const requestSnap = await getDoc(requestRef);
        
        if (requestSnap.exists()) {
          const requestData = requestSnap.data();
          
          // Debug: Log all fields in the requestData to find the organization field
          console.log("Project Request document fields:", Object.keys(requestData));
          console.log("Entire Project Request data:", requestData);
          
          // Try to find any field that might contain organization information
          // Check all these possible field names
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
            // Only update if we are not overwriting existing values
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
        
        // Load assigned authors for this project
        await loadAssignedAuthors();

        // NEW: Check for linked objects to determine if token should be locked
        const linkCheck = await checkForLinkedObjects();
        setLinkedObjectsInfo(linkCheck);
        setTokenLocked(linkCheck.hasLinkedObjects);
        
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    
    // Fix for issue #5: Modified to also include the project owner
    const loadAssignedAuthors = async () => {
      try {
        // Find all users who have this project in their projectRoles
        const usersRef = collection(db, 'projectUsers');
        const userSnapshot = await getDocs(usersRef);
        
        const authors = [];
        let ownerFound = false;
        
        userSnapshot.forEach(userDoc => {
          const userData = userDoc.data();
          const projectRoles = userData.projectRoles || {};
          
          // Check if user is assigned to this project
          if (projectRoles[projectId]) {
            // Add project owner with special marking
            if (projectRoles[projectId] === 'owner') {
              authors.push({
                id: userDoc.id,
                name: userData.name || userData.email,
                email: userData.email,
                role: 'owner'
              });
              ownerFound = true;
            } 
            // Add project authors
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

  const saveProjectToFirestore = async () => {
    setSaveSuccess(false);
    try {
      const projectRef = doc(db, 'projects', projectId);

      // Extract author names for saving
      const authorNames = assignedAuthors.map(author => author.name);

      const updatePayload = {
        projectReferenceNumber: formData.projectReferenceNumber,
        textNumberPrefix: formData.textNumberPrefix,
        title: formData.projectTitle, // Maps to title in Firestore
        projectOrganiser: formData.projectOrganiser,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate,
        description: formData.projectNote, // Maps to description in Firestore
        authors: authorNames, // Use the author names from assignedAuthors
        languages: selectedLanguages,
        copyrightLicensor: formData.copyrightLicensor,
        usageLicence: formData.usageLicence,
        projectType: formData.projectType,
        projectVenue: formData.projectVenue,
        creditLine: formData.creditLine,
        textAudience: formData.textAudience,
        rightsReferenceNumber: formData.rightsReferenceNumber,
        mdsApiToken: token,
        // Save the text settings
        hasHierarchicalText: formData.hasHierarchicalText || false,
        tracksTextStatus: formData.tracksTextStatus || false,
        wantsTextTags: formData.wantsTextTags || false,
        doNotSaveAuthorNames: formData.doNotSaveAuthorNames || false, // Save new field for issue #7
        textStatuses: formData.textStatuses || ['Draft', 'Approved'],
        textTags: formData.textTags || [],
        updatedAt: serverTimestamp(),
        setupComplete: true // Mark setup as complete
      };

      await updateDoc(projectRef, updatePayload);
      
      // Save to combined project data in localStorage
      localStorage.setItem(`projectData_${projectId}`, JSON.stringify({
        ...formData,
        languages: selectedLanguages,
        mdsApiToken: token
      }));
      
      // ADDED: Save the MDS API token with the specific key format
      localStorage.setItem(`mdsApiToken_${projectId}`, token);
      
      // Update original token after successful save
      setOriginalToken(token);
      
      setSaveSuccess(true);
      return { success: true };
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
    setToken: handleTokenChange, // Use our protected handler
    tokenLocked, // NEW: Expose locked state
    linkedObjectsInfo, // NEW: Expose linked objects info
    saveProjectToFirestore,
    loading,
    error,
    saveSuccess,
    setSaveSuccess // Added to export this function
  };
};
