import React from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import styles from "./HomePage.module.css";

const ManagementScreen = () => {
  return (
    <div className={styles.managementScreen}>
      <Header />
      <div className={styles.mainContent}>
        <Sidebar />
        {/* <Dashboard /> */}
      </div>
    </div>
  );
};

export default ManagementScreen;
