import { useParams } from 'react-router-dom';
import QuillEditor from '../QuillEditor/QuillEditor';
import ParentTextSelector from './ParentTextSelector';
import './TextForm.css';
import { Controller, useFormContext } from 'react-hook-form';

const TextForm = ({ projectConfig, text, submitForm, saveError, saveMessage }) => {
  const { projectId } = useParams();

  const {
    register,
    handleSubmit,
    getValues,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useFormContext();

  if (!projectConfig) return

  const handleOptionSelect = (e, field) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    const updatedValues = [...getValues(field), selectedValue];
    setValue(field, updatedValues, { shouldValidate: true });
    e.target.value = ''; // Reset select
  }

  const handleOptionDeselect = (field, valToRemove) => {
    const updatedAuthors = getValues(field).filter(
      (val) => val !== valToRemove
    );
    setValue(field, updatedAuthors);
  }

  const handleCancel = () => {
    // If in edit mode, redirect to texts page
    if (text) {
      window.location.href = `/projects/${projectId}/texts`;
      return
    }
    reset()
  }

  return (
    <form onSubmit={handleSubmit(submitForm)} className='text-form'>
      <div className="text-form-header">
        <h2>
          {text ? 'Edit text' : 'Create new text'}
          {text?.textReferenceNumber && <span className="text-reference"> - {text?.textReferenceNumber}</span>}
        </h2>
      </div>
      <div className="form-group">
        <label>Text</label>
        <Controller
          name="text"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <QuillEditor
              theme="snow"
              value={field.value || ''}
              onChange={field.onChange}
            />
          )}
        />
        {errors.text && <span className="error-message">Text is required</span>}
      </div>
      {projectConfig.hasHierarchicalText && (
        <div className="form-group parent-text-group">
          <label>Parent Text</label>
          <Controller
            name="parentText"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <ParentTextSelector
                projectId={projectId}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      )}
      <div className="form-group">
        <label>Note</label>
        <input {...register('textNote')} />
      </div>
      <div className="form-group">
        <label>Authors</label>
        <select onChange={(e) => handleOptionSelect(e, 'textAuthors')} className="form-select" defaultValue="">
          <option value="">Select author</option>
          {projectConfig.authors
            .filter((projectAuthor) => !watch('textAuthors').includes(projectAuthor))
            .map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
        </select>

        <input type="hidden" {...register('textAuthors', { required: true })} />
        {errors.textAuthors && <span className="error-message">Authors is required</span>}

        {watch('textAuthors').length > 0 && (
          <div className="selected-items-container">
            <ul className="selected-items-list">
              {watch('textAuthors').map((author) => (
                <li key={author} className="selected-item">
                  <span>{author}</span>
                  <button
                    type="button"
                    onClick={() => handleOptionDeselect('textAuthors', author)}
                    className="remove-item-btn"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="form-group">
        <label>Languages</label>
        <select onChange={(e) => handleOptionSelect(e, 'textLanguages')} className="form-select" defaultValue="">
          <option value="">Select language</option>
          {projectConfig.languages
            .filter((language) => !watch('textLanguages').includes(language))
            .map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
        </select>

        <input type="hidden" {...register('textLanguages', { required: true })} />
        {errors.textLanguages && <span className="error-message">Languages is required</span>}

        {watch('textLanguages').length > 0 && (
          <div className="selected-items-container">
            <ul className="selected-items-list">
              {watch('textLanguages').map((language) => (
                <li key={language} className="selected-item">
                  <span>{language}</span>
                  <button
                    type="button"
                    onClick={() => handleOptionDeselect('textLanguages', language)}
                    className="remove-item-btn"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {projectConfig.wantsTextTags && (
        <div className="form-group">
          <label>Tag</label>
          <select {...register('textTag', { required: true })} className="form-select" defaultValue="">
            <option value="">Select a tag</option>
            {projectConfig.textTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          {errors.textTag && <span className="error-message">Tag is required</span>}
        </div>
      )}
      {projectConfig.tracksTextStatus && (
        <div className="form-group">
          <label>Status</label>
          <select {...register('textStatus', { required: true })} className="form-select" defaultValue="">
            <option value="">Select status</option>
            {projectConfig.textStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.textStatus && <span className="error-message">Status is required</span>}
        </div>
      )}
      <div className="form-actions">
        <button type="submit" className="primary-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="secondary-btn" onClick={handleCancel}>Cancel</button>
      </div>
      {saveMessage && <span className="success-message">{saveMessage}</span>}
      {saveError && <span className="error-message">{saveError}</span>}
    </form>
  );
}

export default TextForm;
