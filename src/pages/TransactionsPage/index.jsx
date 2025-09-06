import React from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Transactions from "../../components/Transactions";
// import styles from "../HomePage/HomePage.module.css";
import styles from "../HomePage/HomePage.module.css";


const TransactionsScreen = () => {
  return (
    <div className={styles.managementScreen}>
      <Header />
      <div className={styles.mainContent}>
        <Sidebar />
        <Transactions />
      </div>
    </div>
  );
};


export default TransactionsScreen;
