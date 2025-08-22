import { useState } from "react";
import "./ProjectSetup.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjectForm } from "./hooks/useProjectForm";
import ProjectMetaFields from "./ProjectMetaFields";
import LanguageSelector from "./LanguageSelector";
import RichTextEditor from "./RichTextEditor";
import TextSettings from "./TextSettings";
import { useTexts } from "../../hooks/useTexts";
import AuthorsSelector from "./AuthorsSelector";
import { useAuth } from "../../context/AuthContext";

const ProjectSetup = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { texts } = useTexts(projectId);
  const { userRoles } = useAuth();
  const {
    formData,
    handleFieldChange,
    assignedAuthors,
    setAssignedAuthors,
    selectedLanguages,
    setSelectedLanguages,
    token,
    setToken,
    saveProjectToFirestore,
    loading,
    error,
    saveSuccess,
    setSaveSuccess,
  } = useProjectForm(projectId);
  // Initialize license options with Creative Commons options
  const [licenceOptions, setLicenceOptions] = useState([
    "CC BY 4.0",
    "CC BY-SA 4.0",
    "CC BY-NC 4.0",
    "CC BY-NC-SA 4.0",
    "CC BY-ND 4.0",
    "CC BY-NC-ND 4.0",
    "CC0 1.0",
  ]);

  const [newLicence, setNewLicence] = useState("");
  const [savingForm, setSavingForm] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Validate required fields
    const requiredFields = [
      "projectReferenceNumber",
      "textNumberPrefix",
      "projectTitle",
      "projectOrganiser",
      "projectStartDate",
      "projectEndDate",
      "projectNote",
      "copyrightLicensor",
      "usageLicence",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setSaveError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    if (selectedLanguages.length === 0) {
      setSaveError("Please select at least one language");
      return;
    }

    if (!token) {
      setSaveError("MDS API token is required");
      return;
    }

    setSavingForm(true);
    setSaveError(null);

    try {
      const result = await saveProjectToFirestore();

      if (result.success) {
        // Display success message
        setSaveSuccess(true);

        // Wait 1.5 seconds to display success message, then navigate
        setTimeout(() => {
          navigate(`/projects/${projectId}/objects`);
        }, 1500);
      } else {
        setSaveError(result.error || "Failed to save project");
      }
    } catch (err) {
      console.error("Error in form submission:", err);
      setSaveError(err.message || "An unexpected error occurred");
    } finally {
      setSavingForm(false);
    }
  };

  // Add functions for language handling
  const handleAddLanguage = (language) => {
    if (!selectedLanguages.includes(language)) {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const handleRemoveLanguage = (language) => {
    setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
  };

  const onAddAuthor = (addedAuthor) => {
    setAssignedAuthors((prev) => [...prev, addedAuthor]);
  };
  const onRemoveAuthor = (removedAuthorId) => {
    setAssignedAuthors((prev) => prev.filter((a) => a.id !== removedAuthorId));
  };

  // Handle adding a new license
  const handleAddLicence = () => {
    if (newLicence && !licenceOptions.includes(newLicence)) {
      const updatedOptions = [...licenceOptions, newLicence];
      setLicenceOptions(updatedOptions);

      // Auto-select the new license
      handleFieldChange("usageLicence", newLicence);
      setNewLicence("");

      // Store updated options in localStorage for persistence
      localStorage.setItem("licenceOptions", JSON.stringify(updatedOptions));
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <span className="sr-only">Loading project data...</span>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="project-setup">
        {/* Fix 4: Add header with duplicate save button */}
        <div className="project-setup-header">
          <h1 className="section-title">Project setup</h1>
          <button
            onClick={handleSubmit}
            className="header-save-button"
            disabled={savingForm}
          >
            {savingForm ? "Saving..." : "Save project setup"}
          </button>
        </div>

        {saveError && <div className="error-message">{saveError}</div>}
        {saveSuccess && (
          <div className="success-message">Project saved successfully!</div>
        )}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="project-setup-form">
          <ProjectMetaFields
            formData={formData}
            handleFieldChange={handleFieldChange}
          />

          {/* Project note */}
          <div className="form-group">
            <label htmlFor="projectNote">
              Project note
              <span className="required-indicator">*</span>
              <span
                className="tooltip-icon"
                title="Contextual information about the project. For example, this may include an overview of your project and the main objectives, or if you are working with a group, some more information about who they are and why you are working with them on this project."
              >
                ⓘ
              </span>
            </label>
            <RichTextEditor
              value={formData.projectNote}
              onChange={(content) => handleFieldChange("projectNote", content)}
            />
          </div>

          {/* Languages */}
          <LanguageSelector
            selectedLanguages={selectedLanguages}
            onAddLanguage={handleAddLanguage}
            onRemoveLanguage={handleRemoveLanguage}
          />

          {/* Text Settings - New Component */}
          <TextSettings
            formData={formData}
            handleFieldChange={handleFieldChange}
          />

          <div className="form-group">
            <label htmlFor="authors">
              Authors
              <span className="required-indicator">*</span>
              <span
                className="tooltip-icon"
                title="The authors who created the texts associated with this project."
              >
                ⓘ
              </span>
            </label>
            <p>
              Add new authors to the app via the{" "}
              {userRoles?.appRole === "admin" && (
                <Link to="/admin#users">Manage users page</Link>
              )}
              {userRoles?.appRole !== "admin" && (
                <Link to="/dashboard#authors">Manage authors page</Link>
              )}
              .
            </p>
            <AuthorsSelector
              isAdmin={userRoles?.appRole === "admin"}
              projectID={projectId}
              projectAuthors={formData["authors"]}
              selectedAuthors={assignedAuthors}
              onAddAuthor={onAddAuthor}
              onRemoveAuthor={onRemoveAuthor}
            />
          </div>

          {/* Rights information fields on same line */}
          <div className="form-row">
            {/* Copyright licensor */}
            <div className="form-group half-width">
              <label htmlFor="copyrightLicensor">
                Copyright licensor
                <span className="required-indicator">*</span>
                <span
                  className="tooltip-icon"
                  title="The person or organisation who is authorised to grant usage permission(s) associated with the text. This is not necessarily the copyright holder."
                >
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                id="copyrightLicensor"
                name="copyrightLicensor"
                value={formData.copyrightLicensor || ""}
                onChange={(e) =>
                  handleFieldChange("copyrightLicensor", e.target.value)
                }
                className="text-input"
                required
              />
            </div>

            {/* Usage licence */}
            <div className="form-group half-width">
              <label htmlFor="usageLicence">
                Usage licence
                <span className="required-indicator">*</span>
                <span
                  className="tooltip-icon"
                  title="The type of licence that has been granted. For example, CC BY 4.0. You may also want to list any restrictions on the use."
                >
                  ⓘ
                </span>
              </label>
              <select
                id="usageLicence"
                name="usageLicence"
                value={formData.usageLicence || ""}
                onChange={(e) =>
                  handleFieldChange("usageLicence", e.target.value)
                }
                className="select-input"
                required
              >
                <option value="">Select licence</option>
                {licenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value="custom">+ Add new licence...</option>
              </select>
              {formData.usageLicence === "custom" && (
                <div className="custom-option-input">
                  <input
                    type="text"
                    value={newLicence}
                    onChange={(e) => setNewLicence(e.target.value)}
                    placeholder="Enter licence type"
                    className="text-input custom-input"
                  />
                  <button
                    type="button"
                    onClick={handleAddLicence}
                    className="add-option-btn"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Optional fields - arranged in pairs */}
          <div className="form-row">
            {/* Project type */}
            <div className="form-group half-width">
              <label htmlFor="projectType">
                Project type
                <span
                  className="tooltip-icon"
                  title="A term describing the nature of the project. For example, a workshop, or exhibition."
                >
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                id="projectType"
                name="projectType"
                value={formData.projectType || ""}
                onChange={(e) =>
                  handleFieldChange("projectType", e.target.value)
                }
                className="text-input"
              />
            </div>

            {/* Project venue */}
            <div className="form-group half-width">
              <label htmlFor="projectVenue">
                Project venue
                <span
                  className="tooltip-icon"
                  title="The place where the project is taking place. This may not always be applicable; if you are creating an online exhibition, for example."
                >
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                id="projectVenue"
                name="projectVenue"
                value={formData.projectVenue || ""}
                onChange={(e) =>
                  handleFieldChange("projectVenue", e.target.value)
                }
                className="text-input"
              />
            </div>
          </div>

          {/* Credit line */}
          <div className="form-group">
            <label htmlFor="creditLine">
              Credit line
              <span
                className="tooltip-icon"
                title="Text to acknowledge the copyright holder or text author(s). The format should be agreed with the copyright holder/author(s)."
              >
                ⓘ
              </span>
            </label>
            <input
              type="text"
              id="creditLine"
              name="creditLine"
              value={formData.creditLine || ""}
              onChange={(e) => handleFieldChange("creditLine", e.target.value)}
              className="text-input"
            />
          </div>

          <div className="form-row">
            {/* Text audience */}
            <div className="form-group half-width">
              <label htmlFor="textAudience">
                Text audience
                <span
                  className="tooltip-icon"
                  title="The type of person the text was created for. For example, KS3, or the general public. Use a standard term source."
                >
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                id="textAudience"
                name="textAudience"
                value={formData.textAudience || ""}
                onChange={(e) =>
                  handleFieldChange("textAudience", e.target.value)
                }
                className="text-input"
              />
            </div>

            {/* Rights in/out reference number */}
            <div className="form-group half-width">
              <label htmlFor="rightsReferenceNumber">
                Rights in/out reference number
                <span
                  className="tooltip-icon"
                  title="The unique number used to identify the licence granted to use rights not held by the organisation, or to identify the licence granted to use the organisation's rights."
                >
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                id="rightsReferenceNumber"
                name="rightsReferenceNumber"
                value={formData.rightsReferenceNumber || ""}
                onChange={(e) =>
                  handleFieldChange("rightsReferenceNumber", e.target.value)
                }
                className="text-input"
              />
            </div>
          </div>

          {/* MDS API token */}
          <div className="form-group">
            <label htmlFor="token">
              MDS API token
              <span className="required-indicator">*</span>
              <span
                className="tooltip-icon"
                title="The API token needed to access the Museum Data Service. This is required to fetch object records."
              >
                ⓘ
              </span>
            </label>
            {texts?.length > 0 && (
              <p className="mds-not-editable">
                MDS tokens can't be edited when there are texts already linked
                to the project.
                <br />
                <Link to={`/projects/${projectId}/texts`}>
                  Delete texts here
                </Link>{" "}
                first if you wish to change the token.
              </p>
            )}
            <textarea
              id="token"
              className="token-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your MDS API token here..."
              rows={6}
              required
              disabled={texts?.length > 0}
            />
            <p className="token-help">
              Your token should look similar to:
              9AyjhGNQQFkSCT5QtkaPdQ7-Cz7onxXq231/T8F-QRk1xVnplfxcvDRgm081xpDxKINpIz0zW-vnLXs...
            </p>
          </div>

          {/* Updated: using the same styling as the top button */}
          <div className="form-buttons">
            <button
              type="submit"
              className="header-save-button"
              disabled={savingForm}
            >
              {savingForm ? "Saving..." : "Save project setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSetup;
