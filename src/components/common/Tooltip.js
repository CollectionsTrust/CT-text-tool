const Tooltip = ({ text }) => {
  return (
    <span className="tooltip-icon" title={text}>
      ⓘ
    </span>
  );
};

export default Tooltip;
