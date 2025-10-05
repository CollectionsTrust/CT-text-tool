import Tooltip from "../common/Tooltip";

const FormField = ({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder = "",
  tooltip = "",
}) => {
  const inputClasses = type === "date" ? "date-input" : "text-input";

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && <span className="required-indicator">*</span>}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={inputClasses}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default FormField;
