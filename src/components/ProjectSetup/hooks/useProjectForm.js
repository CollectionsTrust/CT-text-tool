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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadLocalData = () => {
      const storedData = localStorage.getItem(`projectData_${projectId}`);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setFormData((prev) => ({ ...prev, ...parsed }));
        setSelectedLanguages(parsed.languages || ['English']);
        setToken(parsed.mdsApiToken || '');
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
          setToken(projectData.mdsApiToken || '');
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
    setToken,
    saveProjectToFirestore,
    loading,
    error,
    saveSuccess,
    setSaveSuccess // Added to export this function
  };
};
