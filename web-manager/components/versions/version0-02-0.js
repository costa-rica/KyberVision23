import styles from "../../styles/Versions.module.css";
export default function Version0020() {
  return (
    <div className={styles.divVersion}>
      <h2 className={styles.title}>Version 0.2.0</h2>
      <h3>
        Download from Expo Go{" "}
        <a href="https://expo.dev/preview/update?message=probably%20need%20to%20redo%20landscape%20altogether&updateRuntimeVersion=1.0.0&createdAt=2025-01-03T10%3A56%3A44.595Z&slug=exp&projectId=a682a210-65f1-4eb4-afd8-8ab35c4da062&group=f5b4d6f6-812f-4ed7-ab85-0b37cfdd2d43">
          2024-12-28 release
        </a>
      </h3>
      <div>
        <h3>Next Steps</h3>
        <ul>
          <li>Login automatic</li>
          <li>Custom Timeline</li>
          <li>Videos Downloaded</li>
        </ul>
      </div>
      <div>
        <h3>Accomplished</h3>
        <ul>
          <li>Login automatic</li>
          <li>Custom Timeline</li>
        </ul>
      </div>
    </div>
  );
}
