import styles from "../../styles/common/TemplateView.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../reducers/user";
import NavBarSideLink from "./navBarSide/NavBarSideLink";
import NavBarSideDropdown from "./navBarSide/NavBarSideDropdown";
import { toggleNavExpandItem } from "../../reducers/user";
import { useSelector } from "react-redux";

export default function TemplateView({ children }) {
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState(true);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const router = useRouter();

  // --- dynamic styles ---
  const menuWidth = "15rem";
  const { navigator } = router.query;
  const currentPath = navigator || router.pathname;

  return (
    <div className={styles.divTemplateViewScreen}>
      <header
        className={`${styles.headerCustom} ${
          process.env.NEXT_PUBLIC_MODE !== "production"
            ? styles.headerCustomNonProduction
            : ""
        }`}
      >
        <div className={styles.divHeaderLeft}>
          <img
            className={styles.imgLogo}
            src="/images/KyberVisionLogoCrystal.svg"
            alt="Kyber Vision Crystal Logo"
          />
        </div>
        <div className={styles.divHeaderMiddle}>
          <div className={styles.divHeaderMiddleName}>
            {process.env.NEXT_PUBLIC_NAME_APP}
          </div>

          <div className={styles.divHeaderMiddleApiUrl}>
            {process.env.NEXT_PUBLIC_API_BASE_URL}
          </div>
        </div>
        <div className={styles.divHeaderRight}>
          {!menuOpen && (
            <button
              className={styles.hamburgerMenu}
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              <FontAwesomeIcon
                icon={faBars}
                className={styles.faHamburgerMenu}
              />
            </button>
          )}
        </div>
      </header>
      <div className={styles.divTemplateViewMain}>
        <div
          className={styles.divLeftChildren}
          style={{ marginRight: menuOpen ? menuWidth : "0" }}
        >
          {children}
        </div>
        <div
          className={styles.divRightMenu}
          style={{
            display: menuOpen ? "block" : "none",
          }}
        >
          {menuOpen && (
            <div className={styles.divRightMenuClose}>
              <button
                className={styles.hamburgerMenu}
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
              >
                <FontAwesomeIcon icon={faXmark} className={styles.faXmark} />
              </button>
            </div>
          )}

          <div className={styles.divNavBarSideLinks}>
            <NavBarSideLink
              href="/"
              iconFilenameAndPath="/images/menu/house-solid.svg"
              label="Home"
            />
            {/* Volleyball Admin */}
            <NavBarSideDropdown
              iconFilenameAndPath="/images/menu/volleyball-solid.svg"
              label="Volleyball Admin"
              currentPath={currentPath}
              toggleFunction={() =>
                dispatch(toggleNavExpandItem("VolleyballAdmin"))
              }
              expanded={userReducer.navExpandObject.VolleyballAdmin}
            >
              <NavBarSideLink
                href="/admin-volleyball/contract-team-player"
                label="Contracts Team Player"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
              <NavBarSideLink
                href="/admin-volleyball/leagues"
                label="Leagues"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
              <NavBarSideLink
                href="/admin-volleyball/players"
                label="Players"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
              <NavBarSideLink
                href="/admin-volleyball/sessions"
                label="Sessions"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
              <NavBarSideLink
                href="/admin-volleyball/teams"
                label="Teams"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
              <NavBarSideLink
                href="/admin-volleyball/users"
                label="Users"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
            </NavBarSideDropdown>
            {/* Video & Scripting */}
            <NavBarSideDropdown
              iconFilenameAndPath="/images/menu/pen-solid.svg"
              label="Video & Scripting"
              currentPath={currentPath}
              // toggleFunction={() => dispatch(toggleNavExpandReportsAnalysis())}
              toggleFunction={() =>
                dispatch(toggleNavExpandItem("VideoAndScripting"))
              }
              expanded={userReducer.navExpandObject.VideoAndScripting}
            >
              <NavBarSideLink
                href="/scripting-video/contracts-script-video"
                label="Contracts Scripts Video"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
              <NavBarSideLink
                href="/scripting-video/scripts"
                label="Scripts"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
              <NavBarSideLink
                href="/scripting-video/videos"
                label="Videos"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
            </NavBarSideDropdown>

            {/* Manage DB */}

            <NavBarSideDropdown
              iconFilenameAndPath="/images/menu/database-solid.svg"
              label="Manage DB"
              currentPath={currentPath}
              toggleFunction={() => dispatch(toggleNavExpandItem("ManageDb"))}
              expanded={userReducer.navExpandObject.ManageDb}
            >
              <NavBarSideLink
                href="/admin-db/manage-db-backups"
                label="Backups"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
              <NavBarSideLink
                href="/admin-db/manage-db-uploads"
                label="Uploads"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />

              <NavBarSideLink
                href="/admin-db/manage-db-deletes"
                label="Deletes"
                style={{ padding: "0.25rem" }}
                currentPath={currentPath}
              />
            </NavBarSideDropdown>

            {/* Admin General */}
            {/* {userReducer.isAdmin && (
              <NavBarSideDropdown
                iconFilenameAndPath="/images/menu/user-tie-solid-white.svg"
                label="Admin"
                currentPath={currentPath}
                // toggleFunction={() => dispatch(toggleNavExpandAdminGeneral())}
                toggleFunction={() =>
                  dispatch(toggleNavExpandItem("AdminGeneral"))
                }
                expanded={userReducer.navExpandObject.AdminGeneral}
              >
                <NavBarSideLink
                  href="/admin-general/manage-users"
                  label="Users"
                  style={{ padding: "0.25rem" }}
                  currentPath={currentPath}
                />
                <NavBarSideLink
                  href="/admin-general/manage-news-aggregators"
                  label="News Aggregators"
                  style={{ padding: "0.25rem" }}
                  currentPath={currentPath}
                />
              </NavBarSideDropdown>
            )} */}

            <NavBarSideLink
              href="/login"
              iconFilenameAndPath="/images/menu/logout.svg"
              label="Logout"
              onEnterFunction={() => dispatch(logoutUser())}
              currentPath={currentPath}
            />
          </div>
          <div className={styles.divCredits}>
            <Link
              href="https://www.flaticon.com/free-icons/new"
              title="new icons"
            >
              New icons created by Pixel perfect - Flaticon
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
