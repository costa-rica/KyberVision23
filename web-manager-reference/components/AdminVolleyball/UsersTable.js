import styles from "../../styles/AdminVolleyball/SessionsTable.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TemplateView from "../common/TemplateView";
import DynamicDbTable from "../subcomponents/DynamicDbTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function UsersTable() {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    email: "",
    isAdminForKvManagerWebsite: false, // Boolean field handled by radio buttons
  });

  const [usersList, setUsersList] = useState([]);
  const [columns, setColumns] = useState([]);
  const [showPassword, setShowPassword] = useState(false); // 🔹 Toggle password visibility
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!userReducer.token) {
      router.push("/login");
    }
    fetchUsersList();
  }, [userReducer]);

  const fetchUsersList = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table/User`,
      {
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      const resJson = await response.json();
      setUsersList(resJson.data);

      if (resJson.data.length > 0) {
        setColumns(Object.keys(resJson.data[0])); // Extract column names dynamically
      }
    } else {
      console.error(`Error fetching users: ${response.status}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update/${formData.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userReducer.token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.status === 200) {
      alert("User updated successfully!");
      setFormData({
        id: "",
        username: "",
        password: "",
        email: "",
        isAdminForKvManagerWebsite: false,
      });
      fetchUsersList();
    } else {
      const errorJson = await response.json();
      alert(`Error: ${errorJson.error || response.statusText}`);
    }
  };

  const handleDelete = async (userId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      alert("User deleted successfully!");
      fetchUsersList();
    } else {
      alert(`Error deleting user: ${response.status}`);
    }
  };

  const handleSelectRow = (id) => {
    const selectedRow = usersList.find((row) => row.id === id);
    if (selectedRow) {
      const { createdAt, updatedAt, ...filteredRow } = selectedRow;
      setFormData({
        ...filteredRow,
        password: "", // Reset password field when selecting a user
        isAdminForKvManagerWebsite:
          selectedRow.isAdminForKvManagerWebsite || false,
      });
    }
  };

  return (
    <TemplateView>
      <div>
        <main className={styles.main}>
          <div className={styles.mainTop}>
            <h1 className={styles.title}>Update User</h1>
            <div>* Note: Only provide fields that need to be updated</div>
          </div>

          {/* User Form */}
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {Object.keys(formData).map((field) => {
                if (field === "isAdminForKvManagerWebsite") {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label className={"tdWrapAllGlobal"}>{field}:</label>
                      <div className={styles.radioGroup}>
                        <label>
                          <input
                            type="radio"
                            name="isAdminForKvManagerWebsite"
                            value="true"
                            checked={
                              formData.isAdminForKvManagerWebsite === true
                            }
                            onChange={() =>
                              setFormData({
                                ...formData,
                                isAdminForKvManagerWebsite: true,
                              })
                            }
                          />
                          True
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="isAdminForKvManagerWebsite"
                            value="false"
                            checked={
                              formData.isAdminForKvManagerWebsite === false
                            }
                            onChange={() =>
                              setFormData({
                                ...formData,
                                isAdminForKvManagerWebsite: false,
                              })
                            }
                          />
                          False
                        </label>
                      </div>
                    </div>
                  );
                }

                if (field !== "createdAt" && field !== "updatedAt") {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label htmlFor={field}>{field}:</label>

                      {/* Password Field with Show/Hide Icon */}
                      {field === "password" ? (
                        <div className={styles.passwordContainer}>
                          <input
                            type={showPassword ? "text" : "password"}
                            className={styles.inputField}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [field]: e.target.value,
                              })
                            }
                            value={formData[field]}
                          />
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className={styles.iconEyePassword}
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={styles.inputField}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [field]: e.target.value,
                            })
                          }
                          value={formData[field]}
                          required={field !== "id"}
                        />
                      )}
                    </div>
                  );
                }
              })}
              <button type="submit" className={styles.submitButton}>
                Update User
              </button>
            </form>
          </div>

          <DynamicDbTable
            columnNames={columns}
            rowData={usersList}
            onDeleteRow={handleDelete}
            selectedRow={handleSelectRow}
          />
        </main>
      </div>
    </TemplateView>
  );
}

// import styles from "../../styles/UsersTable.module.css";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "next/router";
// import { useState, useEffect } from "react";
// import TemplateView from "../common/TemplateView";
// import DynamicDbTable from "../subcomponents/DynamicDbTable";

// export default function UsersTable() {
//   const [formData, setFormData] = useState({
//     id: "",
//     username: "",
//     password: "",
//     email: "",
//     isAdminForKvManagerWebsite: false, // Boolean field handled by radio buttons
//   });

//   const [usersList, setUsersList] = useState([]);
//   const [columns, setColumns] = useState([]);
//   const userReducer = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const router = useRouter();

//   useEffect(() => {
//     if (!userReducer.token) {
//       router.push("/login");
//     }
//     fetchUsersList();
//   }, [userReducer]);

//   const fetchUsersList = async () => {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table/User`,
//       {
//         headers: { Authorization: `Bearer ${userReducer.token}` },
//       }
//     );

//     if (response.status === 200) {
//       const resJson = await response.json();
//       setUsersList(resJson.data);

//       if (resJson.data.length > 0) {
//         setColumns(Object.keys(resJson.data[0])); // Extract column names dynamically
//       }
//     } else {
//       console.error(`Error fetching users: ${response.status}`);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update/${formData.id}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${userReducer.token}`,
//         },
//         body: JSON.stringify(formData),
//       }
//     );

//     if (response.status === 200) {
//       alert("User updated successfully!");
//       setFormData({
//         id: "",
//         username: "",
//         password: "",
//         email: "",
//         isAdminForKvManagerWebsite: false,
//       });
//       fetchUsersList();
//     } else {
//       const errorJson = await response.json();
//       alert(`Error: ${errorJson.error || response.statusText}`);
//     }
//   };

//   const handleDelete = async (userId) => {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`,
//       {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${userReducer.token}` },
//       }
//     );

//     if (response.status === 200) {
//       alert("User deleted successfully!");
//       fetchUsersList();
//     } else {
//       alert(`Error deleting user: ${response.status}`);
//     }
//   };

//   const handleSelectRow = (id) => {
//     const selectedRow = usersList.find((row) => row.id === id);
//     if (selectedRow) {
//       const { createdAt, updatedAt, ...filteredRow } = selectedRow;
//       setFormData({
//         ...filteredRow,
//         password: "", // Reset password field
//         isAdminForKvManagerWebsite:
//           selectedRow.isAdminForKvManagerWebsite || false,
//       });
//     }
//   };

//   return (
//     <TemplateView>
//       <div>
//         <main className={styles.main}>
//           <div className={styles.mainTop}>
//             <h1 className={styles.title}>Update User</h1>
//             <div>* Note: Only provide fields that need to be updated</div>
//           </div>

//           {/* User Form */}
//           <div className={styles.formContainer}>
//             <form onSubmit={handleSubmit} className={styles.form}>
//               {Object.keys(formData).map((field) => {
//                 if (field === "isAdminForKvManagerWebsite") {
//                   return (
//                     <div key={field} className={styles.inputGroup}>
//                       <label>{field}:</label>
//                       <div className={styles.radioGroup}>
//                         <label>
//                           <input
//                             type="radio"
//                             name="isAdminForKvManagerWebsite"
//                             value="true"
//                             checked={
//                               formData.isAdminForKvManagerWebsite === true
//                             }
//                             onChange={() =>
//                               setFormData({
//                                 ...formData,
//                                 isAdminForKvManagerWebsite: true,
//                               })
//                             }
//                           />
//                           True
//                         </label>
//                         <label>
//                           <input
//                             type="radio"
//                             name="isAdminForKvManagerWebsite"
//                             value="false"
//                             checked={
//                               formData.isAdminForKvManagerWebsite === false
//                             }
//                             onChange={() =>
//                               setFormData({
//                                 ...formData,
//                                 isAdminForKvManagerWebsite: false,
//                               })
//                             }
//                           />
//                           False
//                         </label>
//                       </div>
//                     </div>
//                   );
//                 }

//                 if (field !== "createdAt" && field !== "updatedAt") {
//                   return (
//                     <div key={field} className={styles.inputGroup}>
//                       <label htmlFor={field}>{field}:</label>
//                       <input
//                         type={field === "password" ? "password" : "text"}
//                         className={styles.inputField}
//                         onChange={(e) =>
//                           setFormData({ ...formData, [field]: e.target.value })
//                         }
//                         value={formData[field]}
//                         // required={field !== "id"}
//                       />
//                     </div>
//                   );
//                 }
//               })}
//               <button type="submit" className={styles.submitButton}>
//                 Update User
//               </button>
//             </form>
//           </div>

//           <DynamicDbTable
//             columnNames={columns}
//             rowData={usersList}
//             onDeleteRow={handleDelete}
//             selectedRow={handleSelectRow}
//           />
//         </main>
//       </div>
//     </TemplateView>
//   );
// }
