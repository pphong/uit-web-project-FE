import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Dashboard from "../../components/Dashboard";
import styles from "./HomePage.module.css";


const HomePage = () => {
  return (
    <div className={styles.ManagementScreen}>
      <Header />
      <div className={styles.mainContent}>
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
};


export default HomePage;
