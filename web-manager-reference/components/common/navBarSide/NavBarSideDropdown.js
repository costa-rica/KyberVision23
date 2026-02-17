// import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
export default function NavBarSideDropdown({
  iconFilenameAndPath,
  label,
  toggleFunction,
  children,
  expanded,
}) {
  return (
    <div>
      <div
        onClick={() => {
          toggleFunction();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "1rem",
          color: "white",
          textDecoration: "none",
          border: "1px solid transparent",
          cursor: "pointer",
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border = "1px solid white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = "1px solid transparent";
        }}
      >
        {/* <FontAwesomeIcon
          icon={expanded ? faChevronRight : faChevronDown}
          style={{ width: expanded ? "1rem" : "1.5rem", marginRight: "1rem" }}
        /> */}
        <FontAwesomeIcon
          icon={expanded ? faChevronDown : faChevronRight}
          style={{ width: expanded ? "1.5rem" : "1rem", marginRight: "1rem" }}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={iconFilenameAndPath}
            alt={`<${label} Icon>`}
            style={{ width: "1.5rem", marginRight: "1rem", color: "white" }}
          />
          <span>{label}</span>
        </div>
      </div>
      {Boolean(expanded) && (
        <div style={{ paddingLeft: "2rem" }}>{children}</div>
      )}
      {/* {expanded && <div style={{ paddingLeft: "2rem" }}>{children}</div>} */}
    </div>
  );
}
