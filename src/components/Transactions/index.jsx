// import React from "react";
import React, { useState } from "react";
import { 
  Search, 
  RefreshCw, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  User,
  Book,
  Trash2,
  Copy,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import styles from "./Transactions.module.css";

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("30 ngày gần nhất");
  const [reportFilter, setReportFilter] = useState("Tất cả");
  const [expandedDates, setExpandedDates] = useState(["2025-09-06", "2025-08-13"]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

  // Sample data - trong thực tế sẽ fetch từ API
  const transactions = [
    {
      id: 1,
      date: "2025-09-06",
      category: "Đi lại",
      icon: "👤",
      amount: 0,
      type: "expense",
      account: "Ví",
      description: "--"
    },
    {
      id: 2,
      date: "2025-08-13",
      category: "Sách vở",
      icon: "📚",
      amount: 500000,
      type: "expense",
      account: "Ví",
      description: "--"
    }
  ];

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  const totalIncome = 0;
  const totalExpense = 500000;
  const totalTransactions = 2;

  const toggleDateExpanded = (date) => {
    setExpandedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const getDayTotal = (transactions) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lịch sử giao dịch
        </h1>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Thời gian:</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="7 ngày gần nhất">7 ngày gần nhất</option>
              <option value="30 ngày gần nhất">30 ngày gần nhất</option>
              <option value="3 tháng gần nhất">3 tháng gần nhất</option>
              <option value="6 tháng gần nhất">6 tháng gần nhất</option>
              <option value="1 năm gần nhất">1 năm gần nhất</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Báo cáo:</label>
            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Thu nhập">Thu nhập</option>
              <option value="Chi tiêu">Chi tiêu</option>
            </select>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.actionBtn}>
            <RefreshCw size={18} />
          </button>
          <button className={styles.actionBtn}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Tổng thu:</span>
          <span className={`${styles.summaryValue} ${styles.income}`}>
            {formatCurrency(totalIncome)} ₫
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Tổng chi:</span>
          <span className={`${styles.summaryValue} ${styles.expense}`}>
            {formatCurrency(totalExpense)} ₫
          </span>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.headerCell}>Hạng mục</th>
              <th className={styles.headerCell}>Tổng tiền</th>
              <th className={styles.headerCell}>Tài khoản</th>
              <th className={styles.headerCell}>Diễn giải</th>
              <th className={styles.headerCell}></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
              const { income, expense } = getDayTotal(dayTransactions);
              const isExpanded = expandedDates.includes(date);
              
              return (
                <React.Fragment key={date}>
                  <tr className={styles.dateRow}>
                    <td colSpan={5}>
                      <button
                        className={styles.dateButton}
                        onClick={() => toggleDateExpanded(date)}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span className={styles.dateText}>
                          {formatDate(date)} - {date.split('-').reverse().join('/')}
                        </span>
                        <div className={styles.dateSummary}>
                          <span className={styles.income}>{formatCurrency(income)} ₫</span>
                          <span className={styles.expense}>{formatCurrency(expense)} ₫</span>
                        </div>
                        <button className={styles.deleteDateBtn}>
                          <Trash2 size={16} />
                        </button>
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && dayTransactions.map((transaction) => (
                    <tr key={transaction.id} className={styles.transactionRow}>
                      <td className={styles.categoryCell}>
                        <div className={styles.categoryContainer}>
                          <span className={styles.categoryIcon}>
                            {transaction.category === "Đi lại" ? <User size={16} /> : <Book size={16} />}
                          </span>
                          <span className={styles.categoryName}>{transaction.category}</span>
                        </div>
                      </td>
                      <td className={styles.amountCell}>
                        <span className={`${styles.amount} ${styles[transaction.type]}`}>
                          {formatCurrency(transaction.amount)} ₫
                        </span>
                      </td>
                      <td className={styles.accountCell}>
                        <span className={styles.accountBadge}>
                          {transaction.account}
                        </span>
                      </td>
                      <td className={styles.descriptionCell}>
                        {transaction.description}
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <button className={styles.actionBtn} title="Sao chép">
                            <Copy size={14} />
                          </button>
                          <button className={styles.actionBtn} title="Chỉnh sửa">
                            <Edit size={14} />
                          </button>
                          <button className={styles.actionBtn} title="Xóa">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Tổng số: {totalTransactions}
        </div>
        
        <div className={styles.paginationControls}>
          <div className={styles.itemsPerPage}>
            <span>Số dòng/trang</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={styles.itemsSelect}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className={styles.pageInfo}>
            1 - 2
          </div>

          <div className={styles.pageButtons}>
            <button className={styles.pageBtn} disabled>
              <ChevronsLeft size={16} />
            </button>
            <button className={styles.pageBtn} disabled>
              <ChevronLeft size={16} />
            </button>
            <button className={styles.pageBtn} disabled>
              <ChevronRight size={16} />
            </button>
            <button className={styles.pageBtn} disabled>
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;