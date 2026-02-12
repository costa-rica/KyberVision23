import styles from "../../styles/ScriptingAndVideo/VideoUpload.module.css";
import { useDispatch, useSelector } from "react-redux";
// import { setNewVideoId } from "../reducers/user";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TemplateView from "../common/TemplateView";
import Table03Videos from "../subcomponents/tables/Table03Videos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRectangleXmark,
  faCircleMinus,
} from "@fortawesome/free-solid-svg-icons";
export default function VideoUpload() {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState("");

  const [videosArray, setVideosArray] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // Modal state
  const [uploadProgress, setUploadProgress] = useState(0); // Progress percentage
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false); // State to control modal visibility
  const [uploadMethod, setUploadMethod] = useState("youtube");
  const [deleteVideoObj, setDeleteVideoObj] = useState({});
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!userReducer.token) {
      router.push("/login");
    }
    fetchVideoArray();
  }, [userReducer]);

  const fetchVideoArray = async () => {
    console.log(`API URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}/videos`);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/videos`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userReducer.token}`,
        },
      }
    );

    if (response.status === 200) {
      const resJson = await response.json();
      const videosObjArray = resJson.videosArray.map((elem) => ({
        id: `${elem.id}`,
        name: `${elem.matchName}`,
        date: elem.date,
        sessionId: `${elem.sessionId}`,
        scripted: false,
        sessionDate: elem.session.sessionDate,
        filename: elem.filename,
        processingCompleted: elem.processingCompleted,
        processingFailed: elem.processingFailed,
      }));
      console.log(videosObjArray);
      setVideosArray(videosObjArray);
    } else {
      console.log(`There was a server error: ${response.status}`);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmitAndUploadVideo = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploading(true); // Show modal
    setUploadProgress(0); // Reset progress

    const formData = new FormData();
    formData.append("video", file);
    formData.append("sessionId", sessionId);

    const xhr = new XMLHttpRequest();
    let api_url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/videos/upload`;
    if (uploadMethod === "youtube") {
      api_url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/videos/upload-youtube`;
    }
    xhr.open("POST", api_url);

    if (userReducer.token) {
      xhr.setRequestHeader("Authorization", `Bearer ${userReducer.token}`);
    } else {
      alert("You are not authorized. Please log in.");
      router.push("/login");
      return;
    }

    // Progress handler
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };

    // Load handler
    xhr.onload = () => {
      if (xhr.status === 200) {
        setUploadProgress(100); // Ensure progress reaches 100%
        setTimeout(() => {
          setIsUploading(false); // Hide modal
          fetchVideoArray(); // Refresh video list
          window.location.reload(); // Refresh the entire page
        }, 2000); // Small delay for user feedback
      } else {
        // alert(`Error: ${xhr.status} - ${xhr.statusText}`);
        // setIsUploading(false);
        try {
          const responseJson = JSON.parse(xhr.responseText);
          const message =
            responseJson?.message || `Unexpected error (status: ${xhr.status})`;
          alert(`Upload failed: ${message}`);
        } catch (err) {
          alert(
            `Upload failed. Could not parse error response. Status: ${xhr.status}`
          );
        }
        setIsUploading(false);
      }
    };

    // Error handler
    xhr.onerror = () => {
      setIsUploading(false); // Hide modal
      alert("An error occurred while uploading the video.");
    };

    xhr.send(formData);
  };

  const handleDelete = async (videoObj) => {
    const videoId = videoObj.id;
    const fetchUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/videos/${videoId}`;
    const response = await fetch(fetchUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userReducer.token}`, // Add token to Authorization header
      },
      // body: JSON.stringify({ videoId: videoObj.id }),
    });
    if (response.status == 200) {
      fetchVideoArray();
      const resJson = await response.json();
      window.alert(resJson.message);
      setDeleteModalIsOpen(false);
    } else {
      window.alert(`There was a server error: ${response.status}`);
    }
  };

  return (
    <TemplateView>
      <div>
        <main className={styles.main}>
          <div className={styles.mainTop}>
            <h1 className={styles.title}>Manage Videos</h1>
          </div>

          {/* Upload Form */}
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmitAndUploadVideo} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="videoFileUpload">Upload Video:</label>
                <input
                  id="videoFileUpload"
                  type="file"
                  accept=".mp4, .mov"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="sessionId">Session ID:</label>
                <input
                  className={styles.inputField}
                  onChange={(e) => {
                    setSessionId(e.target.value);
                    console.log(`sessionId: ${e.target.value}`);
                  }}
                  value={sessionId}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <span>Select upload method: </span>
                <select
                  className={styles.dropdown}
                  value={uploadMethod}
                  onChange={(e) => setUploadMethod(e.target.value)}
                >
                  <option value="youtube">via YouTube</option>
                  <option value="oldway">Old way</option>
                </select>
              </div>

              <button type="submit" className={styles.submitButton}>
                Upload
              </button>
            </form>
          </div>

          {/* Video Table */}
          <div className={styles.divTableVideos}>
            <Table03Videos
              setDeleteModalIsOpen={setDeleteModalIsOpen}
              setDeleteVideoObj={setDeleteVideoObj}
              videosArray={videosArray}
            />
          </div>

          {/* Uploading Modal */}
          {isUploading && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                {uploadProgress < 100 ? (
                  <>
                    <p>Uploading... {uploadProgress}%</p>
                    <div className={styles.loadingBar}>
                      <div
                        className={styles.loadingProgress}
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <p>
                    Almost finished ... this window will close when totally
                    complete
                  </p>
                )}
              </div>
            </div>
          )}

          {deleteModalIsOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <div className={styles.modalTop}>
                  <FontAwesomeIcon
                    icon={faRectangleXmark}
                    onClick={() => setDeleteModalIsOpen(false)}
                    className={styles.closeModalIcon}
                  />
                  <h2>Are you sure?</h2>
                  <div className={styles.divModalFilename}>
                    <div> Filename: {deleteVideoObj.filename} </div>

                    <div className={styles.divModalPort}>
                      Session ID: {deleteVideoObj.sessionId}
                    </div>

                    <div>{deleteVideoObj.date}</div>
                  </div>
                </div>

                <button
                  className={styles.btnYesDelete}
                  onClick={() => {
                    console.log(" yes delete me");
                    handleDelete(deleteVideoObj);
                  }}
                >
                  Yes, delete
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </TemplateView>
  );
}
