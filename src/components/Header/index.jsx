import { BarChart3, Bell, User } from "lucide-react";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <BarChart3 size={24} />
          </div>
          <span className={styles.logoText}>Quản lý chi tiêu</span>
        </div>
      </div>
      
      <div className={styles.headerCenter}>
        <span className={styles.greeting}>Xin chào </span>
      </div>
      
      <div className={styles.headerRight}>
        <button className={styles.notificationBtn}>
          <Bell size={20} />
        </button>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;