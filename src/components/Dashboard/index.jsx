import React, { useState, useEffect } from 'react';
// THÊM MỚI: Import Link và useNavigate để chuyển trang
import { Link, useNavigate} from "react-router-dom";
import {
  RefreshCcw,
  Maximize,
  BookOpen,
  Search,
  BarChart2,
  PieChart,
  RotateCcw,
  Expand
} from "lucide-react"; 
import styles from './Dashboard.module.css';



const Dashboard = () => {
    // THÊM MỚI: Khởi tạo useNavigate để chuyển trang
    const navigate = useNavigate();

    //fake backend (MongoDB)
    const [stats, setStats] = useState({
        balance: 0,
        income: 0,
        expense: 0,
        recentNotes: []
    });
    
    // THÊM MỚI: Hàm xử lý khi nhấn expand icon
    const handleExpandRecentNotes = () => {
        navigate('/transactions');
    };

    //Giả lập gọi API lấy dữ liệu từ backend
  useEffect(() => {
    // Sau này sẽ thay bằng fetch hoặc axios.get()
    const fetchData = async () => {
    //   Giả lập dữ liệu backend trả về
      const fakeData = {
        balance: 2000000,
        income: 0,
        expense: 5500000,
        recentNotes: [
          { id: 1, title: "Sách vở", date: "13/08/2025", amount: 500000, currency: "VND" },
          { id: 2, title: "Sách vở", date: "13/08/2025", amount: 500000, currency: "VND" },
          { id: 3, title: "Sách vở", date: "13/08/2025", amount: 500000, currency: "VND" },
          // THÊM MỚI: Thêm nhiều dữ liệu để test việc giới hạn hiển thị
          { id: 4, title: "Ăn uống", date: "12/08/2025", amount: 300000, currency: "VND" },
          { id: 5, title: "Xăng xe", date: "11/08/2025", amount: 200000, currency: "VND" },
        ]
      };

      //Cập nhật state
      setStats(fakeData);
    };

    fetchData();
  }, []); // chạy 1 lần khi load component

  return (
    <div className={styles.dashboard}>
        <div className={styles.dashboardHeader}>
            <h1 className={styles.title}>Trang chủ</h1>
            <div className={styles.controls}>
            <select className={styles.timeSelect}>
                <option>Tháng này</option>
                <option>Tuần này</option>
                <option>Năm này</option>
            </select>
            </div>
        </div>

        <div className={styles.statsGrid}>
            {/* Tổng số dư */}
            <div className={styles.statCard}>
                <div className={styles.statHeader}>
                    <h3>Tổng số dư</h3>
                    <button className={styles.iconBtn}>
                        <RefreshCcw size={18} />
                    </button>
                </div>
                    {stats.balance === 0 ? (
                        <div className={styles.emptyState}>
                            <Search size={32} color="#ccc" />
                            <p>Không có dữ liệu</p>
                        </div>
                    ) : (
                        <div className={styles.statValue}>{stats.balance.toLocaleString()} đ</div>
                    )}
            </div>

            {/* Thu tiền */}
            <div className={styles.statCard}>
                <div className={styles.statHeader}>
                    <h3> Thu tiền </h3>
                    <div className={styles.statIcons}>
                        <button className={styles.iconBtn}>
                            <RefreshCcw size={18} />
                        </button>
                        <button className={styles.iconBtn}>
                            <Maximize size={18} />
                        </button>
                    </div>
                    </div>
                {stats.income === 0 ? (
                    <div className={styles.emptyState}>
                    <Search size={32} color="#ccc" />
                    <p>Không có dữ liệu</p>
                    </div>
                ) : (
                    <div className={styles.statValue}>{stats.income.toLocaleString()} đ</div>
                )}
            </div>

            {/* Giao dịch gần đây */}
            <div className={styles.statCard}>
                <div className={styles.statHeader}>
                    <h3>Giao dịch gần đây</h3>
                    <div className={styles.statIcons}>
                        <button className={styles.iconBtn}>
                            <RotateCcw size={18} />
                        </button>
                        {/* SỬA ĐỔI: Thêm onClick handler cho expand button */}
                        <button className={styles.iconBtn} onClick={handleExpandRecentNotes}>
                            <Expand size={18} />
                        </button>
                    </div>
                </div>

                <div className={styles.recentNote}>
                    {/*Kiểm tra nếu không có ghi chú */}
                    {stats.recentNotes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Search size={32} color="#ccc" />
                            <p>Không có dữ liệu</p>
                        </div>
                    ) : (
                    /*Có dữ liệu - SỬA ĐỔI: Giới hạn chỉ hiển thị tối đa 3 items*/
                    stats.recentNotes.slice(0, 3).map(note => (
                        <div className={styles.noteItem} key={note.id}>
                            <div className={styles.noteIcon}>
                                <BookOpen size={18} color="#ff9800" />
                            </div>
                            <div className={styles.noteContent}>
                                <div className={styles.noteTitle}>{note.title}</div>
                                <div className={styles.noteDate}>{note.date}</div>
                            </div>
                            <div className={styles.noteAmount}>
                                <span className={styles.amount}>
                                    {note.amount.toLocaleString()} đ
                                </span>
                            </div>
                        </div>
                    ))
                    )}
                </div>
            </div>
        </div>

        <div className={styles.chartSection}>
            {/* Tổng quan */}
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3>
                    <BarChart2 size={18} color="#007bff" style={{ marginRight: 6 }} />
                    Tổng quan
                    </h3>
                    <button className={styles.iconBtn}>
                    <RefreshCcw size={18} />
                    </button>
                </div>

                <div className={styles.chartContainer}>
                    <div className={styles.barChart}>
                        {/*Tính tỷ lệ */}
                        {(() => {
                            const maxValue = Math.max(stats.income, stats.expense, 1);
                            const maxHeight = 150; // chiều cao tối đa của cột
                            const incomeHeight = (stats.income / maxValue) * maxHeight;
                            const expenseHeight = (stats.expense / maxValue) * maxHeight;

                            return (
                            <div className={styles.bars}>
                                <div
                                    className={styles.barIncome}
                                    style={{ height: `${incomeHeight}px` }}
                                ></div>
                                <div
                                    className={styles.barExpense}
                                    style={{ height: `${expenseHeight}px` }}
                                ></div>
                            </div>
                            );
                        })()}

                        <div className={styles.chartValues}>
                            <div className={styles.incomeValue}>
                                <span>Tổng thu</span>
                                <span>{stats.income.toLocaleString()} đ</span>
                            </div>
                            <div className={styles.expenseValue}>
                                <span>Tổng chi</span>
                                <span>{stats.expense.toLocaleString()} đ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Biểu đồ tròn (pie chart) */}
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3>
                        <PieChart size={18} color="#e91e63" style={{ marginRight: 6 }} />
                        Chi tiền
                    </h3>
                    <div className={styles.chartIcons}>
                        <button className={styles.iconBtn}>
                            <RefreshCcw size={18} />
                        </button>
                        <button className={styles.iconBtn}>
                            <Maximize size={18} />
                        </button>
                    </div>
                </div>
                <div className={styles.pieChartContainer}>
                    <div className={styles.pieChart}>
                        <div className={styles.donutChart}>
                            <div className={styles.donutCenter}>
                                <span className={styles.percentage}>
                                    {stats.income > 0
                                    ? Math.round((stats.expense / stats.income) * 100)
                                    : 0}
                                    %
                                </span>
                            </div>
                        </div>
                        <div className={styles.chartLegend}>
                            <div className={styles.legendItem}>
                                <span
                                    className={styles.legendColor}
                                    style={{ backgroundColor: '#ffc107' }}
                                ></span>
                                <span>Con cái</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;