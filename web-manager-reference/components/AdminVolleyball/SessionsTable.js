import styles from "../../styles/AdminVolleyball/SessionsTable.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TemplateView from "../common/TemplateView";
import DynamicDbTable from "../subcomponents/DynamicDbTable";

export default function SessionsTable() {
  const [formData, setFormData] = useState({
    leagueId: "",
    teamIdAnalyzed: "",
    teamIdOpponent: "",
    teamIdWinner: "",
    groupContractId: "",
    matchDate: "",
    city: "",
  });

  const [matchesList, setMatchesList] = useState([]);
  const [columns, setColumns] = useState([]);
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    console.log("in useEffect");
    if (!userReducer.token) {
      router.push("/login");
    }
    fetchMatchesList();
  }, [userReducer]);

  const fetchMatchesList = async () => {
    console.log("in fetchMatchesList");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table/Match`,
      {
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      const resJson = await response.json();
      console.log(resJson.data);
      setMatchesList(resJson.data);

      if (resJson.data.length > 0) {
        setColumns(Object.keys(resJson.data[0])); // Extract column names dynamically
      }
    } else {
      console.log(`Error fetching matches: ${response.status}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/update-or-create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userReducer.token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.status === 201) {
      alert("Match created successfully!");
      setFormData({
        leagueId: "",
        teamIdAnalyzed: "",
        teamIdOpponent: "",
        teamIdWinner: "",
        groupContractId: "",
        matchDate: "",
        city: "",
      });
      fetchMatchesList();
    } else {
      const errorJson = await response.json();
      alert(`Error: ${errorJson.error || response.statusText}`);
    }
  };

  const handleDelete = async (matchId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/matches/${matchId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      alert("Match deleted successfully!");
      fetchMatchesList();
    } else {
      alert(`Error deleting match: ${response.status}`);
    }
  };

  const handleSelectRow = (id) => {
    const selectedRow = matchesList.find((row) => row.id === id);
    if (selectedRow) {
      // Exclude "createdAt" and "updatedAt" keys
      const { createdAt, updatedAt, ...filteredRow } = selectedRow;
      setFormData(filteredRow);
    }
  };

  return (
    <TemplateView>
      <div>
        <main className={styles.main}>
          <div className={styles.mainTop}>
            <h1 className={styles.title}>Create Match</h1>
            <div>* Note: For new rows do not enter a value for "id"</div>
          </div>

          {/* Match Form */}
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {Object.keys(formData).map((field) => {
                const isDateField = field.toLowerCase().includes("date"); // Detects "date" in name
                if (field !== "createdAt" || field !== "updatedAt") {
                  return (
                    <div key={field} className={styles.inputGroup}>
                      <label htmlFor={field}>{field}:</label>
                      <input
                        type={isDateField ? "date" : "text"} // Sets type dynamically
                        className={styles.inputField}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        value={formData[field]}
                        required={field !== "id"}
                      />
                    </div>
                  );
                }
              })}
              <button type="submit" className={styles.submitButton}>
                Create Match
              </button>
            </form>
          </div>

          <DynamicDbTable
            columnNames={columns}
            rowData={matchesList}
            onDeleteRow={handleDelete}
            selectedRow={handleSelectRow}
          />
        </main>
      </div>
    </TemplateView>
  );
}
