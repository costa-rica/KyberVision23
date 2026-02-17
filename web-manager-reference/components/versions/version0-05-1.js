import styles from "../../styles/Versions.module.css";
export default function Version0051() {
  return (
    <div className={styles.divVersion}>
      <h2 className={styles.title}>Version 0.5.1</h2>
      <h3>
        <p>
          Download from Expo Go{" "}
          <a href="https://expo.dev/preview/update?message=added%20controls%20to%20landscape%3B%20removed%20colors%20for%20dev&updateRuntimeVersion=1.0.0&createdAt=2025-01-04T08%3A18%3A59.415Z&slug=exp&projectId=a682a210-65f1-4eb4-afd8-8ab35c4da062&group=54da8b5e-2d8b-46f3-8572-6dd638a0eae2">
            2025-01-04 release
          </a>
        </p>
      </h3>
      <div>
        <h3>Next Steps</h3>
        <ul>
          <li>Landscape needs work</li>
          <ul>
            <li>
              Width dimensions seem to extend beyone the height of the screen.
              Making closeing and opening difficult to implement
            </li>
          </ul>
        </ul>
      </div>

      <div>
        <h3>Accomplished</h3>
        <ul>
          <li>Landscape implemented for ios and Android</li>
          <li>Timeline Landscape issues fixed</li>
        </ul>
      </div>
      <div>
        <h3>Demo</h3>
        <ul>
          <li>Demo on iOS requires button to rotate to landscape Landscape</li>
          <li>
            Android but no rotate button. Android adjusts orientation
            automatically.
          </li>
        </ul>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div>
            <h4>iOS</h4>
            <video controls style={{ width: "100%", marginBottom: "20px" }}>
              <source
                src={`https://api.media.atlassian.com/file/0372708c-4bca-49d4-95cf-2facef4a06dc/artifact/video_1280.mp4/binary/cdn?client=08b690c3-e59d-4428-8509-58b751b2789e&collection=contentId-17498134&max-age=2592000&token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIwOGI2OTBjMy1lNTlkLTQ0MjgtODUwOS01OGI3NTFiMjc4OWUiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpjb2xsZWN0aW9uOmNvbnRlbnRJZC0xNzQ5ODEzNCI6WyJyZWFkIl19LCJleHAiOjE3NDMxNjM1NzYsIm5iZiI6MTc0MzE2MDY5NiwiYWFJZCI6IjYzZGQ3YmQzZGI0ZjcxNWM5NzIxNzY5NSJ9.Nn35DAy9uzeY16MK1XLU9KRrQesyed6F-ZeNmpZLjFk`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <div>
            <h4>Android</h4>
            <video controls style={{ width: "100%", marginBottom: "20px" }}>
              <source
                src={`https://api.media.atlassian.com/file/2b352476-3b6e-4acf-8c03-3eb75f3edabe/artifact/video_1280.mp4/binary/cdn?client=08b690c3-e59d-4428-8509-58b751b2789e&collection=contentId-17498134&max-age=2592000&token=eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIwOGI2OTBjMy1lNTlkLTQ0MjgtODUwOS01OGI3NTFiMjc4OWUiLCJhY2Nlc3MiOnsidXJuOmZpbGVzdG9yZTpjb2xsZWN0aW9uOmNvbnRlbnRJZC0xNzQ5ODEzNCI6WyJyZWFkIl19LCJleHAiOjE3NDMxNjM1NzYsIm5iZiI6MTc0MzE2MDY5NiwiYWFJZCI6IjYzZGQ3YmQzZGI0ZjcxNWM5NzIxNzY5NSJ9.Nn35DAy9uzeY16MK1XLU9KRrQesyed6F-ZeNmpZLjFk`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
