import styles from "../../styles/Versions.module.css";

export default function Version0105() {
  return (
    <div className={styles.divVersion}>
      <h2 className={styles.title}>Version 0.10.5</h2>
      <h3>
        <p>
          Download from Expo Go{" "}
          <a href="https://expo.dev/preview/update?message=fix%3A%20action%20recording%20timestamps%20and%20corresponding%20action%20properties%20(2)&updateRuntimeVersion=1.0.0&createdAt=2025-03-08T08%3A50%3A21.000Z&slug=exp&projectId=a4b956e5-22c4-40bf-a3a3-a19e0e8ae396&group=66668002-4cfa-4a34-ac0a-17c794d3f8de">
            week of 2025-03-15 release
          </a>
        </p>
      </h3>
      <div className={styles.divImgQrCode}>
        <img
          className={styles.imgQrCode}
          src="/ExpoVerisonQrCodes/version0105.svg"
          alt="Version 0.10.5"
        />
      </div>

      <ul>
        <li>
          API:{" "}
          <a href="http://api.kv10.dashanddata.com ">
            http://api.kv10.dashanddata.com
          </a>
        </li>
        <li>Server: kv10</li>
        <li>
          GitHub:{" "}
          <a href="git@github.com:costa-rica/kyber-vision-mobile-10.git">
            git@github.com:costa-rica/kyber-vision-mobile-10.git
          </a>
        </li>
      </ul>

      <div>
        <h3>Mobile Features</h3>
        <ul>
          <li>Live scripting screens portrait and landscape</li>
          <li>
            Wheel pickers for quality, type, and subtype in the scripting
            screens
          </li>
        </ul>
      </div>

      <div>
        <h3>API and Manager Features</h3>
        <ul>
          <li>Database backup</li>
          <li>Edit users</li>
          <li>
            Security: KV API Manager access is managed by User Table property
            isAdminForKvManagerWebsite
          </li>
        </ul>
      </div>
      <div>
        <h3>Next Steps</h3>
        <ul>
          <li>Review video screen that displays match video with actions</li>
          <li>Filtering of actions by player or favorites</li>
          <li>API montage video with emailed link to video</li>
        </ul>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <h4>iOS</h4>
          <video controls style={{ width: "100%", marginBottom: "20px" }}>
            <source
              src={`https://api.media.atlassian.com/file/e8224a35-c43a-46e4-b3d0-5e3cddfa2a5c/artifact/video_1280.mp4/binary/cdn?client=08b690c3-e59d-4428-8509-58b751b2789e&collection=contentId-40370178&max-age=2592000&token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIwOGI2OTBjMy1lNTlkLTQ0MjgtODUwOS01OGI3NTFiMjc4OWUiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpjb2xsZWN0aW9uOmNvbnRlbnRJZC00MDM3MDE3OCI6WyJyZWFkIl19LCJleHAiOjE3NDMxNjM2NTYsIm5iZiI6MTc0MzE2MDc3NiwiYWFJZCI6IjYzZGQ3YmQzZGI0ZjcxNWM5NzIxNzY5NSJ9.V6sD-spYlu3SUEVF6RYGwDWAJ5xnfHeCNu04ULd4d4U`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
