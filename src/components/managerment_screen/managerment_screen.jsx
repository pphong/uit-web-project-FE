import React from 'react';
import Header from './headerbar/header';
import Sidebar from './sidebar/sidebar';
// import Dashboard from './dashboard/dashboard';
import styles from './managerment_screen.module.css';


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