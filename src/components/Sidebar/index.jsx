import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", icon: "🏠", label: "Trang chủ", path: "/management" },
    {
      id: "account",
      icon: "👤",
      label: "Tài khoản",
      path: "/management/account",
    },
    {
      id: "notes",
      icon: "📝",
      label: "Ghi chép",
      // path: '/management/notes',
      hasSubmenu: true,
      submenu: [
        {
          id: "add-note",
          label: "Thêm ghi chép",
          path: "/management/notes/add",
        },
        {
          id: "view-notes",
          label: "Xem ghi chép",
          path: "/management/notes/view",
        },
      ],
    },
    {
      id: "history",
      icon: "📋",
      label: "Lịch sử ghi chép",
      path: "/management/history",
    },
    {
      id: "bank",
      icon: "🏦",
      label: "Kết nối ngân hàng",
      path: "/management/bank",
    },
    {
      id: "reports",
      icon: "📊",
      label: "Báo cáo",
      path: "/management/reports",
    },
    {
      id: "utils",
      icon: "⚙️",
      label: "Tiện ích",
      // path: '/management/utils',
      hasSubmenu: true,
      submenu: [
        {
          id: "settings",
          label: "Cài đặt",
          path: "/management/utils/settings",
        },
        { id: "tools", label: "Công cụ", path: "/management/utils/tools" },
      ],
    },
  ];

  const supportItems = [
    {
      id: "support",
      icon: "❓",
      label: "Hỗ trợ khách hàng",
      path: "/management/support",
    },
    { id: "inbox", icon: "📨", label: "Thu gọn", path: "/management/inbox" },
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.addButton}>
        <button className={styles.addBtn}>
          <span className={styles.addIcon}>+</span>
          <span>Thêm ghi chép</span>
          <span className={styles.dropdownIcon}>▼</span>
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <Link
                to={item.path}
                className={`${styles.menuLink} ${
                  activeItem === item.id ? styles.active : ""
                }`}
                onClick={() => handleItemClick(item.id)}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
                {item.hasSubmenu && (
                  <span className={styles.submenuIcon}>▼</span>
                )}
              </Link>
              {item.hasSubmenu && activeItem === item.id && (
                <ul className={styles.submenu}>
                  {item.submenu.map((subItem) => (
                    <li key={subItem.id}>
                      <Link to={subItem.path} className={styles.submenuLink}>
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.divider}></div>

        <ul className={styles.supportList}>
          {supportItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <Link
                to={item.path}
                className={`${styles.menuLink} ${
                  activeItem === item.id ? styles.active : ""
                }`}
                onClick={() => handleItemClick(item.id)}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
