import React from 'react';
import styles from './header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📊</div>
          <span className={styles.logoText}>Quản lý chi tiêu</span>
        </div>
      </div>
      
      <div className={styles.headerCenter}>
        <span className={styles.greeting}>Xin chào </span>
      </div>
      
      <div className={styles.headerRight}>
        <button className={styles.notificationBtn}>
          🔔
        </button>
        <div className={styles.userProfile}>
          <div className={styles.avatar}></div>
        </div>
      </div>
    </header>
  );
};
export default Header;