import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { 
  Home, 
  User, 
  FileText, 
  Clipboard, 
  Building2, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Mail,
  Plus,
  ChevronDown
} from "lucide-react";
import ModalForm from "../ModalForm/transactionform";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Trang chủ", path: "/management" },
    {
      id: "account",
      icon: User,
      label: "Tài khoản",
      path: "/wallet",
    },
    {
      id: "notes",
      icon: FileText,
      label: "Giao dịch",
      // path: '/management/notes',
      hasSubmenu: true,
      submenu: [
        {
          id: "add-note",
          label: "Thêm giao dịch",
          // path: "/management/notes/add",
          onClick: () => setIsModalOpen(true)
        },
        {
          id: "view-notes",
          label: "Xem giao dịch",
          path: "/transactions",
        },
      ],
    },
    {
      id: "history",
      icon: Clipboard,
      label: "Lịch sử giao dịch",
      path: "/management/history",
    },
    {
      id: "bank",
      icon: Building2,
      label: "Kết nối ngân hàng",
      path: "/management/bank",
    },
    {
      id: "reports",
      icon: BarChart3,
      label: "Báo cáo",
      path: "/management/reports",
    },
    {
      id: "utils",
      icon: Settings,
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
      icon: HelpCircle,
      label: "Hỗ trợ khách hàng",
      path: "/management/support",
    },
    { id: "inbox", icon: Mail, label: "Thu gọn", path: "/management/inbox" },
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
  };

  const handleSubmenuClick = (subItem, e) => {
    if (subItem.onClick) {
      e.preventDefault();
      subItem.onClick();
    }
  };

  return (
    <>
      <div className={styles.sidebar}>
        {/* <div className={styles.addButton}>
          <button 
            className={styles.addBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <span className={styles.addIcon}>
              <Plus size={16} />
            </span>
            <span>Thêm ghi chép</span>
            <span className={styles.dropdownIcon}>
              <ChevronDown size={14} />
            </span>
          </button>
        </div> */}

        <nav className={styles.nav}>
          <ul className={styles.menuList}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id} className={styles.menuItem}>
                  <Link
                    to={item.path || "#"}
                    className={`${styles.menuLink} ${
                      activeItem === item.id ? styles.active : ""
                    }`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <span className={styles.menuIcon}>
                      <IconComponent size={18} />
                    </span>
                    <span className={styles.menuLabel}>{item.label}</span>
                    {item.hasSubmenu && (
                      <span className={styles.submenuIcon}>
                        <ChevronDown size={14} />
                      </span>
                    )}
                  </Link>
                  {item.hasSubmenu && activeItem === item.id && (
                    <ul className={styles.submenu}>
                      {item.submenu.map((subItem) => (
                        <li key={subItem.id}>
                          <Link 
                            to={subItem.path} 
                            className={styles.submenuLink}
                            onClick={(e) => handleSubmenuClick(subItem, e)}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className={styles.divider}></div>

          <ul className={styles.supportList}>
            {supportItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id} className={styles.menuItem}>
                  <Link
                    to={item.path}
                    className={`${styles.menuLink} ${
                      activeItem === item.id ? styles.active : ""
                    }`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <span className={styles.menuIcon}>
                      <IconComponent size={18} />
                    </span>
                    <span className={styles.menuLabel}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <ModalForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;