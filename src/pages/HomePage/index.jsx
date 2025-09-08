// src/pages/HomePage/index.jsx
import { useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import CategoryLabelManager from "../../components/CategoryLabelManager";
import WalletManager from "../../components/wallets/WalletManager";
import Dashboard from "../../components/Dashboard";
import ComingSoon from "../../components/ComingSoon";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const [active, setActive] = useState("categories");

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.body}>
        <Sidebar activeKey={active} onSelect={setActive} />
        <main className={styles.content}>
          {active === "categories" && <CategoryLabelManager />}
          {active === "accounts" && <WalletManager />}
          {active === "home" && <Dashboard />}

          {active === "history" && <ComingSoon title="Lịch sử ghi chép" />}
          {active === "support" && <ComingSoon title="Hỗ trợ khách hàng" />}
          {active === "note-single" && <ComingSoon title="Ghi chép thu chi" />}
          {active === "note-batch" && <ComingSoon title="Ghi chép hàng loạt" />}
          {active === "note-excel" && <ComingSoon title="Nhập bằng Excel" />}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
