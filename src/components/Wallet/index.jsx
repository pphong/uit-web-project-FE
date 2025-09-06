import React, { useState } from 'react';
import { Search, RefreshCw, Settings, Send, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
// import styles from './wallet.module.css';
import styles from './Wallet.module.css'
import WalletForm from '../ModalForm/walletform';

const Wallet = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // const [accountType, setAccountType] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  // const [report, setReport] = useState('Tất cả');
//   const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);


  const accounts = [
    {
      id: 1,
      name: 'Ví',
      balance: '500,000 ₫',
      status: 'Đang hoạt động',
      type: 'Tiền mặt'
    }
  ];

  const totalAmount = '500,000 ₫';

  return (
    <div className={styles.walletContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Danh sách tài khoản</h1>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.activeTab}`}>
          Tài khoản của tôi
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
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

        {/* <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          className={styles.select}
        >
          <option value="Tất cả">Loại tài khoản: Tất cả</option>
          <option value="Tiền mặt">Tiền mặt</option>
          <option value="Ngân hàng">Ngân hàng</option>
        </select> */}

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.select}
        >
          <option value="Tất cả">Trạng thái: Tất cả</option>
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Tạm khóa">Tạm khóa</option>
        </select>

        <button
          className={styles.addBtn}
          onClick={() => setIsModalOpen(true)}
        >
          + Thêm ví
        </button>

        {/* <select
          value={report}
          onChange={(e) => setReport(e.target.value)}
          className={styles.select}
        >
          <option value="Tất cả">Báo cáo: Tất cả</option>
        </select> */}

        {/* <button className={styles.refreshBtn}>
          <RefreshCw size={16} />
        </button> */}

        <button className={styles.refreshBtn}>
          <RefreshCw size={16} />
        </button>

        <button className={styles.settingsBtn}>
          <Settings size={16} />
        </button>
      </div>

      {/* Total Amount */}
      <div className={styles.totalAmount}>
        <span className={styles.totalLabel}>Tổng tiền:</span>
        <span className={styles.totalValue}>{totalAmount}</span>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên tài khoản</th>
              <th>Số dư</th>
              <th>Trạng thái</th>
              <th>Loại tài khoản</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>
                  <div className={styles.accountName}>
                    <div className={styles.accountIcon}>
                      <span>V</span>
                    </div>
                    {account.name}
                  </div>
                </td>
                <td className={styles.balance}>{account.balance}</td>
                <td>
                  <span className={styles.statusActive}>
                    {account.status}
                  </span>
                </td>
                <td>{account.type}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn}>
                      <Send size={16} />
                    </button>
                    <button className={styles.actionBtn}>
                      <Trash2 size={16} />
                    </button>
                    <button className={styles.actionBtn}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          <span>Tổng số: 1</span>
        </div>
        
        <div className={styles.paginationControls}>
          <div className={styles.itemsPerPageContainer}>
            <span>Số dòng/trang</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className={styles.itemsPerPageSelect}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className={styles.pageInfo}>
            <span>1 - 1</span>
          </div>
          
          <div className={styles.paginationButtons}>
            <button className={styles.paginationBtn} disabled>
              <ChevronsLeft size={16} />
            </button>
            <button className={styles.paginationBtn} disabled>
              <ChevronLeft size={16} />
            </button>
            <button className={styles.paginationBtn} disabled>
              <ChevronRight size={16} />
            </button>
            <button className={styles.paginationBtn} disabled>
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <WalletForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Wallet;