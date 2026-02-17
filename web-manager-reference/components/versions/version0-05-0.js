import styles from "../../styles/Versions.module.css";
export default function Version0050() {
  return (
    <div className={styles.divVersion}>
      <h2 className={styles.title}>Version 0.5.0</h2>
      <h3>
        <p>
          Download from Expo Go{" "}
          <a href="https://expo.dev/preview/update?message=Portrait%20mode%20scripting%20looks%20ok&updateRuntimeVersion=1.0.0&createdAt=2025-01-03T17%3A10%3A12.024Z&slug=exp&projectId=a682a210-65f1-4eb4-afd8-8ab35c4da062&group=492b26a4-2835-4e07-a63c-1f13e34d9f08">
            2025-01-03 release
          </a>
        </p>
      </h3>
      <div>
        <h3>Next Steps</h3>
        <ul>
          <li>Landscape needs work</li>
          <ul>
            <li>Custom Timeline Gestures not advancing play.currentTime</li>
            <li>Custom Timeline not displaying action timestamps circles</li>
          </ul>
          <li>Ensure Android auto orient functions correctly resize styles</li>
        </ul>
      </div>

      <div>
        <h3>Accomplished</h3>
        <ul>
          <li>termenology scripts is now actions</li>
          <li>
            Portriat orientation displays timeline with markers for actions
          </li>
          <li>
            New database structure: where actions is the primary table storing
            the timestamps and relative information
          </li>
          <ul>
            <li>Scripts</li>
            <li>Actions</li>
            <li>Videos</li>
          </ul>
          <li>Actions downloaded from API when video selected</li>
          <li>Delete script (all actions) button and connected to API</li>
          <li>Register new actions button and connected to API</li>
        </ul>
      </div>
    </div>
  );
}
