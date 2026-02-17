import { useState, useEffect } from "react";
import styles from "../../styles/admin-db/AdminDb.module.css";
import TemplateView from "../common/TemplateView";
import { useDispatch, useSelector } from "react-redux";

export default function ManageDbDeletes() {
  const [arrayRowCountsByTable, setArrayRowCountsByTable] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const userReducer = useSelector((state) => state.user);

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

  const confirmDeleteTable = (tableName) => {
    setSelectedTable(tableName);
    setShowModal(true);
  };

  const deleteTable = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table/${selectedTable}`,
        {
          method: "DELETE",
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
      setShowModal(false);
      fetchRowCountsByTable(); // Refresh data
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.divMain}>
          <div className={styles.divDbDescription}>
            <h1>
              <u>Delete Tables</u>
            </h1>

            <p>Notes for deleting</p>
            <ul>
              <li>
                Deleting tables with relationships defined could cause cascading
                deletes for exampel deleting Player table will cause all
                PlayerContracts to delete
              </li>
            </ul>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Table Name</th>
                  <th>Row Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {arrayRowCountsByTable.length > 0 &&
                  arrayRowCountsByTable.map((item, index) => (
                    <tr key={index} className={styles.tableRow}>
                      <td>{item.tableName}</td>
                      <td>{item.rowCount}</td>
                      <td>
                        {item.tableName != "User" &&
                          item.tableName != "GroupContract" && (
                            <button
                              className={styles.btnDelete}
                              onClick={() => confirmDeleteTable(item.tableName)}
                            >
                              Delete Table
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <p>
                Are you sure you want to delete the table '{selectedTable}'?
              </p>

              <button className={styles.btnDelete} onClick={deleteTable}>
                Yes
              </button>

              <button
                className={styles.btnCancel}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </TemplateView>
  );
}
