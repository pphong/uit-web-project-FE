import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import styles from "./HomePage.module.css";

const HomePage = () => {
  return (
    <div className={styles.header}>
      <Header />
      <div className={styles.sidebar}>
        <Sidebar />
        {/* <Dashboard /> */}
      </div>
    </div>
  );
};

export default HomePage;
