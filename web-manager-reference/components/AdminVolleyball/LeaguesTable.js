// import styles from "../../styles/LeagueTable.module.css";
import styles from "../../styles/AdminVolleyball/SessionsTable.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TemplateView from "../common/TemplateView";
import DynamicDbTable from "../subcomponents/DynamicDbTable";

export default function LeagueTable() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
  });

  const [leaguesList, setLeaguesList] = useState([]);
  const [columns, setColumns] = useState([]);
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!userReducer.token) {
      router.push("/login");
    }
    fetchLeaguesList();
  }, [userReducer]);

  const fetchLeaguesList = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table/League`,
      {
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      const resJson = await response.json();
      setLeaguesList(resJson.data);

      if (resJson.data.length > 0) {
        setColumns(Object.keys(resJson.data[0]));
      }
    } else {
      console.log(`Error fetching leagues: ${response.status}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/leagues/update-or-create`,
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
      alert(`League ${formData.id ? "updated" : "created"} successfully!`);
      setFormData({ id: "", name: "", category: "" });
      fetchLeaguesList();
    } else {
      const errorJson = await response.json();
      alert(`Error: ${errorJson.error || response.statusText}`);
    }
  };

  const handleDelete = async (leagueId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/leagues/${leagueId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      alert("League deleted successfully!");
      fetchLeaguesList();
    } else {
      alert(`Error deleting league: ${response.status}`);
    }
  };

  const handleSelectRow = (id) => {
    const selectedRow = leaguesList.find((row) => row.id === id);
    if (selectedRow) {
      setFormData(selectedRow);
    }
  };

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.mainTop}>
          <h1 className={styles.title}>Manage Leagues</h1>
          <div>* Note: For new rows do not enter a value for "id"</div>
        </div>

        {/* League Form */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {Object.keys(formData)
              .filter((field) => field !== "createdAt" && field !== "updatedAt") // Exclude timestamps
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
              {formData.id ? "Update League" : "Create League"}
            </button>
          </form>
        </div>

        {/* Leagues Table */}
        <DynamicDbTable
          columnNames={columns}
          rowData={leaguesList}
          onDeleteRow={handleDelete}
          selectedRow={handleSelectRow}
        />
      </main>
    </TemplateView>
  );
}
