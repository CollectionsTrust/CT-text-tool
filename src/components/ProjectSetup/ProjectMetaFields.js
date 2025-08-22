const ProjectMetaFields = ({ formData, handleFieldChange }) => {
  return (
    <>
      {/* First row with two fields */}
      <div className="form-row">
        {/* Project reference number */}
        <div className="form-group half-width">
          <label htmlFor="projectReferenceNumber">
            Project reference number
            <span className="required-indicator">*</span>
            <span
              className="tooltip-icon"
              title="The unique number assigned to your project. This may include a prefix to distinguish it from other projects followed by a year and running number. If you are working on a large project that involves several smaller projects such as workshops, you may wish to sub-number these projects using the same prefix. For example, LWD2022.1.1, LWD2022.1.2"
            >
              ⓘ
            </span>
          </label>
          <input
            type="text"
            id="projectReferenceNumber"
            name="projectReferenceNumber"
            value={formData.projectReferenceNumber || ""}
            onChange={(e) =>
              handleFieldChange("projectReferenceNumber", e.target.value)
            }
            className="text-input"
            required
          />
        </div>

        {/* Text number prefix */}
        <div className="form-group half-width">
          <label htmlFor="textNumberPrefix">
            Text number prefix
            <span className="required-indicator">*</span>
            <span
              className="tooltip-icon"
              title="The default prefix for the text reference number is TXT followed by a sequential number starting at 0001. If you have your own text numbering system and wish to amend this prefix you can do so here."
            >
              ⓘ
            </span>
          </label>
          <input
            type="text"
            id="textNumberPrefix"
            name="textNumberPrefix"
            value={formData.textNumberPrefix || "TXT"}
            onChange={(e) =>
              handleFieldChange("textNumberPrefix", e.target.value)
            }
            className="text-input"
            placeholder="TXT"
            required
          />
        </div>
      </div>

      {/* Project title */}
      <div className="form-group">
        <label htmlFor="projectTitle">
          Project title
          <span className="required-indicator">*</span>
          <span
            className="tooltip-icon"
            title="The name of your project. For example, the title of an exhibition, workshop or collections review."
          >
            ⓘ
          </span>
        </label>
        <input
          type="text"
          id="projectTitle"
          name="projectTitle"
          value={formData.projectTitle || ""}
          onChange={(e) => handleFieldChange("projectTitle", e.target.value)}
          className="text-input"
          required
        />
      </div>

      {/* Project organiser */}
      <div className="form-group">
        <label htmlFor="projectOrganiser">
          Project organiser
          <span className="required-indicator">*</span>
          <span
            className="tooltip-icon"
            title="The person or organisation organising the project. Usually the museum. If the project is being organised by several museums as part of a partnership, use the lead museum, or use the name of the partnership. For example, Wessex Museums."
          >
            ⓘ
          </span>
        </label>
        <input
          type="text"
          id="projectOrganiser"
          name="projectOrganiser"
          value={formData.projectOrganiser || ""}
          onChange={(e) =>
            handleFieldChange("projectOrganiser", e.target.value)
          }
          className="text-input"
          required
        />
      </div>

      {/* Date fields on same line */}
      <div className="form-row">
        {/* Project start date */}
        <div className="form-group half-width">
          <label htmlFor="projectStartDate">
            Project start date
            <span className="required-indicator">*</span>
            <span className="tooltip-icon" title="The date the project began.">
              ⓘ
            </span>
          </label>
          <input
            type="date"
            id="projectStartDate"
            name="projectStartDate"
            value={formData.projectStartDate || ""}
            onChange={(e) =>
              handleFieldChange("projectStartDate", e.target.value)
            }
            className="date-input"
            required
          />
        </div>

        {/* Project end date */}
        <div className="form-group half-width">
          <label htmlFor="projectEndDate">
            Project end date
            <span className="required-indicator">*</span>
            <span
              className="tooltip-icon"
              title="The date the project ended or is due to end. You can edit this later, before archiving the project, if the date changes."
            >
              ⓘ
            </span>
          </label>
          <input
            type="date"
            id="projectEndDate"
            name="projectEndDate"
            value={formData.projectEndDate || ""}
            onChange={(e) =>
              handleFieldChange("projectEndDate", e.target.value)
            }
            className="date-input"
            required
          />
        </div>
      </div>
    </>
  );
};

export default ProjectMetaFields;
