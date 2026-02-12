import styles from "../../styles/Versions.module.css";

export default function Version0112() {
  return (
    <div className={styles.divVersion}>
      <h2 className={styles.title}>Version 0.11.2</h2>
      <h3>
        <p>
          Download from Expo Go{" "}
          <a href="https://expo.dev/preview/update?message=feat%3A%20ReviewMatchSelection%20warns%20users%20size%20of%20file%20to%20download&updateRuntimeVersion=1.0.0&createdAt=2025-03-19T15%3A58%3A18.814Z&slug=exp&projectId=b4e97972-1374-4149-9e59-af883f724ba0&group=dbd50f6d-4c15-4af3-b95c-de1cb1fc2f1b">
            2025-03-20 release
          </a>
        </p>
      </h3>
      <div className={styles.divImgQrCode}>
        <img
          className={styles.imgQrCode}
          src="/ExpoVerisonQrCodes/version0112.svg"
          alt="Version 0.11.2"
        />
      </div>

      <ul>
        <li>
          API:{" "}
          <a href="http://api.kv11.dashanddata.com">
            http://api.kv11.dashanddata.com
          </a>
        </li>
        <li>Server: kv11</li>
        <li>
          GitHub:{" "}
          <a href="https://github.com/costa-rica/kyber-vision-mobile-11">
            https://github.com/costa-rica/kyber-vision-mobile-11
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
          <li>Review Video landscape only</li>
          <li>Review Video can filter on players</li>
          <li>Review Video can select favorites and filter on favorites</li>
          <li>
            Review Video has a share button that will trigger the api to create
            a video montage and send link of completed video Montage to user’s
            email
          </li>
          <li>
            Review Video Match Selection warns users size of video the will
            download
          </li>
        </ul>
      </div>

      <div>
        <h3>API and Manager Features</h3>
        <ul>
          <li>
            API route GET /matches/:matchId/actions is used by Review Video
          </li>
          <li>
            This route modifies the actions array. It creates a new property
            called timestampFromStartOfVideo which is the timestamp of the
            action – a calculated estimated Start of video, that uses the
            deltaTime from the syncContracts table. A module function in
            modules/scripts.js called createEstimatedTimestampStartOfVideo
            accomplishes this.
          </li>
          <li>API routes for video montage</li>
          <li>
            API uses a queueing module to queue montage video requests – only
            one at a time.
          </li>
          <li>
            Created a new micro service called KyberVisionVideoProcessor01.
          </li>
          <li>
            Receives “jobs” from the KV API queueing module using the JavaScript
            spawn package
          </li>
          <li>
            Messages include the location on the server where the video is,
            user’s token for authentication, and list of action JSON objects
            that include the timestamp where the video montage should base each
            clip
          </li>
          <li>
            Each clip starts 1.5 seconds before the action timestamp and ends
            1.5 after the action timestamp.
          </li>
        </ul>
      </div>
      <div>
        <h3>Next Steps</h3>
        <ul>
          <li>Sync video methodology</li>
          <li>Management of users, players, matches</li>
          <li>Implement new style</li>
        </ul>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <h4>iOS</h4>
          <video controls style={{ width: "100%", marginBottom: "20px" }}>
            <source
              src={`https://api.media.atlassian.com/file/a65bade5-919a-469f-9beb-4f9412e24aa7/artifact/video_1280.mp4/binary/cdn?client=08b690c3-e59d-4428-8509-58b751b2789e&collection=contentId-40370193&max-age=2592000&token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIwOGI2OTBjMy1lNTlkLTQ0MjgtODUwOS01OGI3NTFiMjc4OWUiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpjb2xsZWN0aW9uOmNvbnRlbnRJZC00MDM3MDE5MyI6WyJyZWFkIl19LCJleHAiOjE3NDMxNjI3OTgsIm5iZiI6MTc0MzE1OTkxOCwiYWFJZCI6IjYzZGQ3YmQzZGI0ZjcxNWM5NzIxNzY5NSJ9.FGxb3tnwENLNV8-t6FBWX0IIz03dCibW3UgQSQJmJTw`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
