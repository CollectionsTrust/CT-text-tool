import { Tooltip as ReactTooltip } from "react-tooltip";

const Tooltip = ({ children }) => {
  return (
    <>
      <span
        className="tooltip-icon"
        id="tooltip"
        data-tooltip-id="my-tooltip"
        data-tooltip-content={children}
      >
        ⓘ
      </span>
      <ReactTooltip
        id="my-tooltip"
        style={{ maxWidth: "380px", zIndex: 1000 }}
      />
    </>
  );
};

export default Tooltip;
