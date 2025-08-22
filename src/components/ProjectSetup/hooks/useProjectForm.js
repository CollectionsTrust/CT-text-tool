import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

export const useProjectForm = (projectId) => {
  const [formData, setFormData] = useState({
    projectReferenceNumber: "",
    textNumberPrefix: "TXT", // Default value
    projectTitle: "",
    projectOrganiser: "",
    projectStartDate: "",
    projectEndDate: "",
    projectNote: "",
    copyrightLicensor: "",
    usageLicence: "",
    projectType: "",
    projectVenue: "",
    creditLine: "",
    textAudience: "",
    rightsReferenceNumber: "",
    hasHierarchicalText: false,
    tracksTextStatus: false,
    wantsTextTags: false,
    doNotSaveAuthorNames: false,
    textStatuses: ["Draft", "Approved"],
    textTags: [],
  });

  const [assignedAuthors, setAssignedAuthors] = useState([]);
  const [originalAuthors, setOriginalAuthors] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState(["English"]); // Default to English
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);

        // Load project data from Firestore
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();

          setFormData((prev) => ({
            ...prev,
            projectReferenceNumber: projectData.projectReferenceNumber || "",
            textNumberPrefix: projectData.textNumberPrefix || "TXT",
            projectTitle: projectData.title || "",
            projectOrganiser: projectData.projectOrganiser || "",
            projectStartDate: projectData.projectStartDate || "",
            projectEndDate: projectData.projectEndDate || "",
            projectNote: projectData.description || "",
            copyrightLicensor: projectData.copyrightLicensor || "",
            usageLicence: projectData.usageLicence || "",
            projectType: projectData.projectType || "",
            projectVenue: projectData.projectVenue || "",
            creditLine: projectData.creditLine || "",
            textAudience: projectData.textAudience || "",
            rightsReferenceNumber: projectData.rightsReferenceNumber || "",
            // Load text settings data
            hasHierarchicalText: projectData.hasHierarchicalText || false,
            tracksTextStatus: projectData.tracksTextStatus || false,
            wantsTextTags: projectData.wantsTextTags || false,
            doNotSaveAuthorNames: projectData.doNotSaveAuthorNames || false, // Load new field
            textStatuses: projectData.textStatuses || ["Draft", "Approved"],
            textTags: projectData.textTags || [],
          }));

          setSelectedLanguages(projectData.languages || ["English"]);
          setToken(projectData.mdsApiToken || "");
        }

        // Try to load initial data from projectRequests if available
        const requestRef = doc(db, "projectRequests", projectId);
        const requestSnap = await getDoc(requestRef);

        if (requestSnap.exists()) {
          const requestData = requestSnap.data();

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
            "";

          setFormData((prev) => {
            // Only update if we are not overwriting existing values
            const updatedFormData = { ...prev };

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
        console.error("Error fetching project data:", err);
        setError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    const loadAssignedAuthors = async () => {
      try {
        // Find all users who have this project in their projectRoles
        const usersRef = collection(db, "projectUsers");
        const userSnapshot = await getDocs(usersRef);

        const authors = [];

        userSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          const projectRoles = userData.projectRoles || {};

          // Check if user is assigned to this project
          if (projectRoles[projectId]) {
            // Add project owner with special marking
            if (projectRoles[projectId] === "owner") {
              authors.push({
                id: userDoc.id,
                name: userData.name || userData.email,
                email: userData.email,
                allProjectRoles: projectRoles,
                role: "owner",
              });
            }
            // Add project authors
            else if (projectRoles[projectId] === "author") {
              authors.push({
                id: userDoc.id,
                name: userData.name || userData.email,
                email: userData.email,
                allProjectRoles: projectRoles,
                role: "author",
              });
            }
          }
        });

        setAssignedAuthors(authors);
        setOriginalAuthors(authors);
      } catch (err) {
        console.error("Error loading assigned authors:", err);
      }
    };

    loadProjectData();
  }, [projectId]);

  const saveAssignedAuthors = async (
    projectId,
    originalAuthors,
    assignedAuthors
  ) => {
    originalAuthors.forEach((author) => {
      if (assignedAuthors.find((a) => a.id === author.id)) return;

      const userRef = doc(db, "projectUsers", author.id);
      const fieldToDelete = `projectRoles.${projectId}`;

      updateDoc(userRef, {
        [fieldToDelete]: null,
      });
    });

    assignedAuthors.forEach((author) => {
      if (originalAuthors.find((a) => a.id === author.id)) return;

      const userRef = doc(db, "projectUsers", author.id);
      const fieldToAdd = `projectRoles.${projectId}`;

      updateDoc(userRef, {
        [fieldToAdd]: "author",
      });
    });
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveProjectToFirestore = async () => {
    setSaveSuccess(false);
    try {
      const projectRef = doc(db, "projects", projectId);

      const updatePayload = {
        projectReferenceNumber: formData.projectReferenceNumber,
        textNumberPrefix: formData.textNumberPrefix,
        title: formData.projectTitle, // Maps to title in Firestore
        projectOrganiser: formData.projectOrganiser,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate,
        description: formData.projectNote, // Maps to description in Firestore
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
        textStatuses: formData.textStatuses || ["Draft", "Approved"],
        textTags: formData.textTags || [],
        updatedAt: serverTimestamp(),
        setupComplete: true, // Mark setup as complete
      };

      await updateDoc(projectRef, updatePayload);
      await saveAssignedAuthors(projectId, originalAuthors, assignedAuthors);

      setSaveSuccess(true);
      return { success: true };
    } catch (err) {
      console.error("Error saving project to Firestore:", err);
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
    setAssignedAuthors,
    token,
    setToken,
    saveProjectToFirestore,
    loading,
    error,
    saveSuccess,
    setSaveSuccess, // Added to export this function
  };
};
