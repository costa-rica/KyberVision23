import styles from "../../styles/AdminVolleyball/SessionsTable.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TemplateView from "../common/TemplateView";
import DynamicDbTable from "../subcomponents/DynamicDbTable";

export default function PlayersTable() {
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    birthDate: "",
  });

  const [playersList, setPlayersList] = useState([]);
  const [columns, setColumns] = useState([]);
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!userReducer.token) {
      router.push("/login");
    }
    fetchPlayersList();
  }, [userReducer]);

  const fetchPlayersList = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table/Player`,
      {
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      const resJson = await response.json();
      setPlayersList(resJson.data);

      if (resJson.data.length > 0) {
        setColumns(Object.keys(resJson.data[0]));
      }
    } else {
      console.log(`Error fetching players: ${response.status}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      birthDate: formData.birthDate
        ? new Date(formData.birthDate).toISOString()
        : null, // Convert date to ISO format
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/players/update-or-create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userReducer.token}`,
        },
        body: JSON.stringify(formattedData),
      }
    );

    if (response.status === 201 || response.status === 200) {
      alert(`Player ${formData.id ? "updated" : "created"} successfully!`);
      setFormData({ id: "", firstName: "", lastName: "", birthDate: "" });
      fetchPlayersList();
    } else {
      const errorJson = await response.json();
      alert(`Error: ${errorJson.error || response.statusText}`);
    }
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/players/update-or-create`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${userReducer.token}`,
  //         },
  //         body: JSON.stringify(formData),
  //       }
  //     );

  //     if (response.status === 201 || response.status === 200) {
  //       alert(`Player ${formData.id ? "updated" : "created"} successfully!`);
  //       setFormData({ id: "", firstName: "", lastName: "", birthDate: "" });
  //       fetchPlayersList();
  //     } else {
  //       const errorJson = await response.json();
  //       alert(`Error: ${errorJson.error || response.statusText}`);
  //     }
  //   };

  const handleDelete = async (playerId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/players/${playerId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      alert("Player deleted successfully!");
      fetchPlayersList();
    } else {
      alert(`Error deleting player: ${response.status}`);
    }
  };

  const handleSelectRow = (id) => {
    const selectedRow = playersList.find((row) => row.id === id);
    if (selectedRow) {
      const { createdAt, updatedAt, birthDate, ...filteredRow } = selectedRow;

      // Convert birthDate to 'YYYY-MM-DD' format if it exists
      if (birthDate) {
        filteredRow.birthDate = birthDate.split("T")[0]; // Extract only YYYY-MM-DD
      }

      setFormData(filteredRow);
    }
  };
  //   const handleSelectRow = (id) => {
  //     const selectedRow = playersList.find((row) => row.id === id);
  //     if (selectedRow) {
  //       const { createdAt, updatedAt, ...filteredRow } = selectedRow;
  //       setFormData(filteredRow);
  //     }
  //   };

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.mainTop}>
          <h1 className={styles.title}>Manage Players</h1>
          <div>* Note: For new rows do not enter a value for "id"</div>
        </div>

        {/* Player Form */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {Object.keys(formData)
              .filter((field) => field !== "createdAt" && field !== "updatedAt") // Exclude timestamps
              .map((field) => {
                const isDateField = field.toLowerCase().includes("date"); // Detect date field
                return (
                  <div key={field} className={styles.inputGroup}>
                    <label htmlFor={field}>{field}:</label>
                    <input
                      type={isDateField ? "date" : "text"}
                      className={styles.inputField}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      value={formData[field]}
                      required={field !== "id"}
                    />
                  </div>
                );
              })}
            <button type="submit" className={styles.submitButton}>
              {formData.id ? "Update Player" : "Create Player"}
            </button>
          </form>
        </div>

        {/* Players Table */}
        <DynamicDbTable
          columnNames={columns}
          rowData={playersList}
          onDeleteRow={handleDelete}
          selectedRow={handleSelectRow}
        />
      </main>
    </TemplateView>
  );
}
