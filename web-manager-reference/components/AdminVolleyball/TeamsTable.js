// import styles from "../../styles/TeamsTable.module.css";
import styles from "../../styles/AdminVolleyball/SessionsTable.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TemplateView from "../common/TemplateView";
import DynamicDbTable from "../subcomponents/DynamicDbTable";

export default function TeamsTable() {
  const [formData, setFormData] = useState({
    id: "",
    teamName: "",
    city: "",
    coachName: "",
  });

  const [teamsList, setTeamsList] = useState([]);
  const [columns, setColumns] = useState([]);
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!userReducer.token) {
      router.push("/login");
    }
    fetchTeamsList();
  }, [userReducer]);

  const fetchTeamsList = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table/Team`,
      {
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      const resJson = await response.json();
      setTeamsList(resJson.data);

      if (resJson.data.length > 0) {
        setColumns(Object.keys(resJson.data[0]));
      }
    } else {
      console.log(`Error fetching teams: ${response.status}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/update-or-create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userReducer.token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.status === 201 || response.status === 200) {
      alert(`Team ${formData.id ? "updated" : "created"} successfully!`);
      setFormData({ id: "", teamName: "", city: "", coachName: "" });
      fetchTeamsList();
    } else {
      const errorJson = await response.json();
      alert(`Error: ${errorJson.error || response.statusText}`);
    }
  };

  const handleDelete = async (teamId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams/${teamId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      alert("Team deleted successfully!");
      fetchTeamsList();
    } else {
      alert(`Error deleting team: ${response.status}`);
    }
  };

  const handleSelectRow = (id) => {
    const selectedRow = teamsList.find((row) => row.id === id);
    if (selectedRow) {
      const { createdAt, updatedAt, ...filteredRow } = selectedRow;
      setFormData(filteredRow);
    }
  };

  return (
    <TemplateView>
      <div>
        <main className={styles.main}>
          <div className={styles.mainTop}>
            <h1 className={styles.title}>Manage Teams</h1>
            <div>* Note: For new rows do not enter a value for "id"</div>
          </div>

          {/* Team Form */}
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {Object.keys(formData)
                .filter(
                  (field) => field !== "createdAt" && field !== "updatedAt"
                ) // Exclude timestamps
                .map((field) => (
                  <div key={field} className={styles.inputGroup}>
                    <label htmlFor={field}>{field}:</label>
                    <input
                      className={styles.inputField}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      value={formData[field]}
                      required={field !== "id"}
                    />
                  </div>
                ))}
              <button type="submit" className={styles.submitButton}>
                {formData.id ? "Update Team" : "Create Team"}
              </button>
            </form>
          </div>

          {/* Teams Table */}
          <DynamicDbTable
            columnNames={columns}
            rowData={teamsList}
            onDeleteRow={handleDelete}
            selectedRow={handleSelectRow}
          />
        </main>
      </div>
    </TemplateView>
  );
}

// import styles from "../../styles/AdminVolleyball/SessionsTable.module.css";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "next/router";
// import { useState, useEffect } from "react";
// import TemplateView from "../common/TemplateView";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTrash } from "@fortawesome/free-solid-svg-icons";

// export default function TeamsTable() {
//   const [teamName, setTeamName] = useState("");
//   const [city, setCity] = useState("");

//   const [groupPassword, setGroupPassword] = useState("");
//   const [coachName, setCoachName] = useState("");
//   const [visibleToAll, setVisibleToAll] = useState("");
//   const [teamsList, setTeamsList] = useState([]);
//   const userReducer = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const router = useRouter();

//   useEffect(() => {
//     if (!userReducer.token) {
//       router.push("/login");
//     }
//     fetchTeamsList();
//   }, [userReducer]);

//   const fetchTeamsList = async () => {
//     console.log(
//       `Fetching matches from ${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`
//     );

//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`,
//       {
//         headers: { Authorization: `Bearer ${userReducer.token}` },
//       }
//     );

//     if (response.status === 200) {
//       const resJson = await response.json();
//       setTeamsList(resJson);
//     } else {
//       console.log(`Error fetching matches: ${response.status}`);
//     }
//   };

//   return (
//     <TemplateView>
//       <div>
//         <main className={styles.main}>
//           <div className={styles.mainTop}>
//             <h1 className={styles.title}>Create Team</h1>
//           </div>

//           {/* Team Form */}
//           <div className={styles.formContainer}>
//             <form onSubmit={handleSubmit} className={styles.form}>
//               <div className={styles.inputGroup}>
//                 <label htmlFor="teamIdAnalyzed">Team Name:</label>
//                 <input
//                   className={styles.inputField}
//                   onChange={(e) => setTeamName(e.target.value)}
//                   value={teamName}
//                   required
//                 />
//               </div>

//               <div className={styles.inputGroup}>
//                 <label htmlFor="teamIdOpponent">Team City:</label>
//                 <input
//                   className={styles.inputField}
//                   onChange={(e) => setCity(e.target.value)}
//                   value={city}
//                 />
//               </div>
//               <div className={styles.inputGroup}>
//                 <label htmlFor="teamIdWinner">Coach Name:</label>
//                 <input
//                   className={styles.inputField}
//                   onChange={(e) => setCoachName(e.target.value)}
//                   value={coachName}
//                 />
//               </div>
//               <div className={styles.inputGroup}>
//                 <label htmlFor="matchDate">Visible to all:</label>
//                 <input
//                   type="date"
//                   className={styles.inputField}
//                   value={visibleToAll}
//                   onChange={(e) => setVisibleToAll(e.target.value)}
//                   required
//                 />
//               </div>

//               <button type="submit" className={styles.submitButton}>
//                 Create Match
//               </button>
//             </form>
//           </div>

//           {/* Matches Table */}
//           <div className={styles.divTable}>
//             <h2>Existing Matches</h2>
//             <table className={styles.table}>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Team Name</th>
//                   <th>City </th>
//                   <th>Coach Name</th>
//                   <th>Visible to all</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {teamsList.map((team) => (
//                   <tr key={team.id}>
//                     <td>{team.id}</td>

//                     <td>{team.city}</td>
//                     <td>
//                       <button
//                         className={styles.deleteButton}
//                         onClick={() => handleDelete(team.id)}
//                       >
//                         <FontAwesomeIcon icon={faTrash} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </main>
//       </div>
//     </TemplateView>
//   );
// }
