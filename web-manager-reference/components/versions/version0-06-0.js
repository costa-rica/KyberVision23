import styles from "../../styles/Versions.module.css";

export default function Version0060() {
  return (
    <div className={styles.divVersion}>
      <h2 className={styles.title}>Version 0.6.0</h2>
      <h3>
        <p>
          Download from Expo Go{" "}
          <a href="https://expo.dev/preview/update?message=added%20font%20to%20other%20screens%3B%20modifs%20Scripting%20Portrait&updateRuntimeVersion=1.0.0&createdAt=2025-01-11T10%3A51%3A40.756Z&slug=exp&projectId=19bda6d6-1261-4ffc-9425-4e157bd11f4b&group=d469754a-d038-4726-aa79-ba9543efc788">
            2025-01-11 release
          </a>
        </p>
      </h3>
      <div>
        <h3>Next Steps</h3>
        <ul>
          <li>Quality score not working </li>
          <ul>
            <li>probably implement device database to store quailty</li>
          </ul>
        </ul>
      </div>

      <div>
        <h3>Accomplished</h3>
        <ul>
          <li>Added new font: Apfel Grotesk</li>
          <li>Timeline Landscape issues fixed</li>
        </ul>
      </div>
      {/* <div>
      <h3>Demo</h3>
      <ul>
        <li>
          Demo on iOS requires button to rotate to landscape Landscape
        </li>
        <li>
          Android but no rotate button. Android adjusts orientation
          automatically.
        </li>
      </ul>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <h4>iOS</h4>
          <video
            controls
            style={{ width: "100%", marginBottom: "20px" }}
          >
            <source
              src={`https://api.kv05.dashanddata.com/videos/demo/KV0.5.1.mp4`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
        <div>
          <h4>Android</h4>
          <video
            controls
            style={{ width: "100%", marginBottom: "20px" }}
          >
            <source
              src={`https://api.kv05.dashanddata.com/videos/demo/KV0.5.1android.mp4`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div> */}
    </div>
  );
}
