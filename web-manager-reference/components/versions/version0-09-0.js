import styles from "../../styles/Versions.module.css";

export default function Version0090() {
  return (
    <div className={styles.divVersion}>
      <h2 className={styles.title}>Version 0.9.0</h2>
      <h3>
        <p>
          Download from Expo Go{" "}
          <a href="https://expo.dev/preview/update?message=%20demo%20version%20linked%20to%20api.kv08&updateRuntimeVersion=1.0.0&createdAt=2025-02-24T14%3A33%3A49.131Z&slug=exp&projectId=4cf94a18-97c5-4929-984b-7ab881b46446&group=5352f7c2-7408-4011-81d7-da759490bed1">
            week of 2025-02-24 release
          </a>
        </p>
      </h3>
      <div className={styles.divImgQrCode}>
        <img
          className={styles.imgQrCode}
          src="/ExpoVerisonQrCodes/version0090.svg"
          alt="Version 0.9.0"
        />
      </div>

      <ul>
        <li>
          API:{" "}
          <a href="https://api.kv08.dashanddata.com">
            https://api.kv08.dashanddata.com
          </a>
        </li>
        <li>Server: kv08</li>
        <li>
          GitHub:{" "}
          <a href="https://github.com/costa-rica/kyber-vision-mobile-09">
            https://github.com/costa-rica/kyber-vision-mobile-09
          </a>
        </li>
      </ul>

      <div>
        <h3>Mobile Features</h3>
        <ul>
          <li>
            This is the version that was shared with FFVB 2024-02-25 in meeting
            with Arnaud Bessat.
          </li>
          <li>New Splash Screen on launch</li>
          <li>Login / register to Kyber Vision</li>
          <li>Scripting Live Portrait and Landscape have wheel pad</li>
          <li>Scripting Video Portrait has wheel pad</li>
          <li>
            Scripting Video Landscape not implemented and orienting app to
            Landscape will cause an error
          </li>
          <li>Colors on wheel were updated</li>
        </ul>
      </div>

      <div>
        <h3>Next Steps</h3>
        <ul>
          <li>Prepare for March 15 live scripting testers</li>
          <li>No wheel only tapping on live screens</li>
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
