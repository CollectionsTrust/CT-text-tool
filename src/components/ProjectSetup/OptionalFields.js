import FormField from '../common/FormField';

const OptionalFields = ({ formData, handleFormChange }) => {
  return (
    <>
      {/* Project type */}
      <FormField
        id="projectType"
        name="projectType"
        label="Project type"
        value={formData.projectType || ''}
        onChange={handleFormChange}
        required={false}
        tooltip="A term describing the nature of the project. For example, a workshop, or exhibition."
      />
      
      {/* Project venue */}
      <FormField
        id="projectVenue"
        name="projectVenue"
        label="Project venue"
        value={formData.projectVenue || ''}
        onChange={handleFormChange}
        required={false}
        tooltip="The place where the project is taking place. This may not always be applicable; if you are creating an online exhibition, for example."
      />
      
      {/* Credit line */}
      <FormField
        id="creditLine"
        name="creditLine"
        label="Credit line"
        value={formData.creditLine || ''}
        onChange={handleFormChange}
        required={false}
        tooltip="Text to acknowledge the copyright holder or text author(s). The format should be agreed with the copyright holder/author(s)."
      />
      
      {/* Text audience */}
      <FormField
        id="textAudience"
        name="textAudience"
        label="Text audience"
        value={formData.textAudience || ''}
        onChange={handleFormChange}
        required={false}
        tooltip="The type of person the text was created for. For example, KS3, or the general public. Use a standard term source."
      />
      
      {/* Rights in/out reference number */}
      <FormField
        id="rightsReferenceNumber"
        name="rightsReferenceNumber"
        label="Rights in/out reference number"
        value={formData.rightsReferenceNumber || ''}
        onChange={handleFormChange}
        required={false}
        tooltip="The unique number used to identify the licence granted to use rights not held by the organisation, or to identify the licence granted to use the organisation's rights."
      />
    </>
  );
};

export default OptionalFields;
