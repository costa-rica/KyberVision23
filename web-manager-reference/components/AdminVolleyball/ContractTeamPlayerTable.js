// import styles from "../../styles/LeagueTable.module.css";
import styles from "../../styles/AdminVolleyball/SessionsTable.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import TemplateView from "../common/TemplateView";
import DynamicDbTable from "../subcomponents/DynamicDbTable";

export default function ContractTeamPlayerTable() {
  const [formData, setFormData] = useState({
    id: "",
    playerId: "",
    teamId: "",
    shirtNumber: "",
  });

  const [tableDataList, setTableDataList] = useState([]);
  const [columns, setColumns] = useState([]);
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!userReducer.token) {
      router.push("/login");
    }
    fetchTableDataList();
  }, [userReducer]);

  const fetchTableDataList = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table/ContractTeamPlayer`,
      {
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      const resJson = await response.json();
      setTableDataList(resJson.data);

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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/player-contracts/update-or-create`,
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
      alert(
        `Player Contract ${formData.id ? "updated" : "created"} successfully!`
      );
      setFormData({ id: "", name: "", category: "" });
      fetchTableDataList();
    } else {
      const errorJson = await response.json();
      alert(`Error: ${errorJson.error || response.statusText}`);
    }
  };

  const handleDelete = async (playerContractId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/player-contracts/${playerContractId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      alert("Player Contract deleted successfully!");
      fetchTableDataList();
    } else {
      alert(`Error deleting player contract: ${response.status}`);
    }
  };

  const handleSelectRow = (id) => {
    const selectedRow = tableDataList.find((row) => row.id === id);
    if (selectedRow) {
      setFormData(selectedRow);
    }
  };

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.mainTop}>
          <h1 className={styles.title}>Manage Player Contracts</h1>
          <div>* Note: For new rows do not enter a value for "id"</div>
        </div>

        {/* Player Contract Form */}
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
              {formData.id
                ? "Update Player Contract"
                : "Create Player Contract"}
            </button>
          </form>
        </div>

        {/* Player Contracts Table */}
        <DynamicDbTable
          columnNames={columns}
          rowData={tableDataList}
          onDeleteRow={handleDelete}
          selectedRow={handleSelectRow}
        />
      </main>
    </TemplateView>
  );
}
