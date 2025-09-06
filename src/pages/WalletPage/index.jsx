import React from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Wallet from "../../components/Wallet";
import styles from "../HomePage/HomePage.module.css";


const WalletScreen = () => {
  return (
    <div className={styles.managementScreen}>
      <Header />
      <div className={styles.mainContent}>
        <Sidebar />
        <Wallet />
      </div>
    </div>
  );
};


export default WalletScreen;
