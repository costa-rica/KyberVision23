import { useState, useEffect } from "react";
import styles from "../../styles/admin-db/AdminDb.module.css";
import TemplateView from "../common/TemplateView";
import { useDispatch, useSelector } from "react-redux";

export default function ManageDbUploads() {
  const [arrayBackups, setArrayBackups] = useState([]);
  const [arrayRowCountsByTable, setArrayRowCountsByTable] = useState([]);
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchRowCountsByTable();
  }, []);

  const fetchRowCountsByTable = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/db-row-counts-by-table`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
        }
      );

      if (response.status !== 200) {
        console.log(`There was a server error: ${response.status}`);
        return;
      }
      const resJson = await response.json();
      setArrayRowCountsByTable(resJson.arrayRowCountsByTable);
    } catch (error) {
      console.error("Error fetching row counts:", error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("backupFile", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/import-db-backup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userReducer.token}`, // Add token to Authorization header
          },
          body: formData,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      let resJson = null;
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        console.log("----> contentType includes json");
        resJson = await response.json();
      }

      if (response.status !== 200) {
        console.error("Upload failed:", response.status);
        // alert("Upload failed.");

        if (resJson?.failedOnTableName) {
          alert(
            `${resJson.error}, but failed on table: ${resJson.failedOnTableName}`
          );
        } else {
          const errorMessage =
            resJson?.error || `There was a server error: ${response.status}`;
          alert(errorMessage);
        }
      } else {
        alert("Upload successful!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      fetchRowCountsByTable();
    }
  };

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.divMain}>
          <h1>Upload to Database</h1>

          <div className={styles.divImportData}>
            <p>
              Upload a .zip file of your database. <u>Rules for uploads:</u>
            </p>
            <ul>
              <li>Only .zip files are accepted.</li>
              <li>Missing tables will be ignored.</li>
              <li>Empty cell values are ok (except for id column)</li>
              <li>
                Must have an id for each row that is not already in the table
              </li>
              <li>No missing columns.</li>
              <li>
                Contrary to db schema, names of columns in CSV should be in
                camelCase but that is how the Java Model properties are named.
              </li>
              <li>
                Also, names of files should follow naming conventions found in
                "Row Counts by Table" (yes, also contrary to db schema). They
                are the names of the JavaScript Model objects - all singular.
              </li>
            </ul>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.divInputGroup}>
                <label htmlFor="dbFileUpload">Upload DB .zip file:</label>
                <input
                  id="dbFileUpload"
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Upload
              </button>
            </form>
          </div>

          <div className={styles.divDbDescription}>
            <h1>Row Counts by Table</h1>
            <ul>
              {arrayRowCountsByTable.length > 0 &&
                arrayRowCountsByTable.map((item, index) => (
                  <li key={index}>
                    {item.tableName}: {item.rowCount}
                  </li>
                ))}
            </ul>
          </div>

          {/* Upload Progress Modal */}
          {isUploading && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h2>Uploading...</h2>
                <p>{uploadProgress}%</p>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </TemplateView>
  );
}
