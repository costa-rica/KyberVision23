import Link from "next/link";
import { useRouter } from "next/router";

export default function NavBarSideLink({
  href,
  iconFilenameAndPath = false,
  style,
  label,
  currentPath,
  onEnterFunction = () => {},
  dateAdded = null,
}) {
  const router = useRouter();
  const isNew = (() => {
    if (!dateAdded) return false;
    const addedDate = new Date(dateAdded);
    const today = new Date();
    const diffTime = today - addedDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 5;
  })();
  // works for everything in pages/articles
  const currentPathModified = router.pathname.replace(
    "[navigator]",
    currentPath
  );
  // Define default styles
  const defaultStyles = {
    display: "flex",
    alignItems: "center",
    padding: "1rem",
    color: "white",
    textDecoration: "none",
    backgroundColor: currentPathModified === href ? "black" : "transparent",
    border: "1px solid transparent",
  };
  // Merge provided style with default styles
  const mergedStyle = { ...defaultStyles, ...style };

  return (
    <div style={{ position: "relative" }}>
      <Link href={href} passHref legacyBehavior>
        <a
          style={mergedStyle}
          onClick={() => onEnterFunction()}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = "1px solid white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border =
              currentPathModified === href
                ? "1px solid black"
                : "1px solid transparent";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = "black";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor =
              currentPathModified === href ? "black" : "transparent";
          }}
        >
          {iconFilenameAndPath && (
            <img
              src={iconFilenameAndPath}
              alt={`<${label} Icon>`}
              style={{ width: "1.5rem", marginRight: "1rem", color: "white" }}
            />
          )}
          <span>{label}</span>
        </a>
      </Link>
      {isNew && (
        <img
          src="/images/new.png"
          alt="New"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "2rem",
            height: "auto",
          }}
        />
      )}
    </div>
    // <Link href={href} passHref legacyBehavior>
    //   <a
    //     style={mergedStyle}
    //     onClick={(e) => {
    //       onEnterFunction(); // ← Only run on actual click
    //     }}
    //     // onMouseEnter: triggers on hover
    //     onMouseEnter={(e) => {
    //       e.currentTarget.style.border = "1px solid white";
    //     }}
    //     onMouseLeave={(e) => {
    //       e.currentTarget.style.border =
    //         currentPathModified === href
    //           ? "1px solid black"
    //           : "1px solid transparent";
    //     }}
    //     onMouseDown={(e) => {
    //       e.currentTarget.style.backgroundColor = "black";
    //     }}
    //     onMouseUp={(e) => {
    //       e.currentTarget.style.backgroundColor =
    //         currentPathModified === href ? "black" : "transparent";
    //     }}
    //   >
    //     {iconFilenameAndPath && (
    //       <img
    //         src={iconFilenameAndPath}
    //         alt={`<${label} Icon>`}
    //         style={{ width: "1.5rem", marginRight: "1rem", color: "white" }}
    //       />
    //     )}
    //     <span>{label}</span>
    //   </a>
    // </Link>
  );
}
