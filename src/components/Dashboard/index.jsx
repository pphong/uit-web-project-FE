import React, { useEffect, useMemo, useState } from "react";
import ExpenseDonut from "./ExpenseDonut";
import styles from "./Dashboard.module.css";
import { RotateCcw, Search, Book } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";

/* ===== helpers auth/fetch ===== */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const pickToken = (state) =>
  state?.accessToken ||
  state?.token ||
  state?.user?.accessToken ||
  JSON.parse(localStorage.getItem("auth") || "{}").accessToken ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token") ||
  "";

const makeFetchAuth =
  (token) =>
  (path, opts = {}) =>
    fetch(`${API_URL}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

const fmtMoney = (n, ccy = "VND") =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: ccy,
    maximumFractionDigits: ccy === "VND" ? 0 : 2,
  }).format(Number(n || 0));

/* ====== UI card nhỏ ====== */
function Card({ title, right, children }) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHead}>
        <h4>{title}</h4>
        <div className={styles.cardActions}>{right}</div>
      </header>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

/* ====== Dashboard ====== */
export default function Dashboard() {
  const { state } = useAuth();
  const token = pickToken(state);
  const api = makeFetchAuth(token);

  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [txns, setTxns] = useState([]); // gộp tất cả ví
  const [expCats, setExpCats] = useState([]);

  // bộ lọc thời gian đơn giản: tháng này / tháng trước
  const [range, setRange] = useState("this-month");

  const { start, end } = useMemo(() => {
    const now = new Date();
    let s, e;
    if (range === "last-month") {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );
      s = first;
      e = last;
    } else {
      // this-month
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      s = first;
      e = last;
    }
    return { start: s, end: e };
  }, [range]);

  const load = async () => {
    setLoading(true);
    try {
      // 1) wallets
      const rw = await api(`/api/v1/wallets`);
      const jw = await rw.json().catch(() => ({}));
      const list = Array.isArray(jw?.data?.wallets) ? jw.data.wallets : [];
      const ws = list.map((w) => ({
        id: w._id || w.id,
        name: w.name,
        currency: w.currency || "VND",
        balance: w.balance ?? w.currentBalance ?? 0,
      }));
      setWallets(ws);

      // 2) categories expense (để đặt tên nhóm)
      const rc = await api(`/api/v1/categories/type/expense`);
      const jc = await rc.json().catch(() => ({}));
      setExpCats(Array.isArray(jc?.data?.categories) ? jc.data.categories : []);

      // 3) transactions: gom của mọi ví (page 1, limit 100, sort desc)
      let all = [];
      for (const w of ws) {
        const rt = await api(
          `/api/v1/transactions/wallet/${w.id}?page=1&limit=100&sort=-date`
        );
        const jt = await rt.json().catch(() => ({}));
        const arr = Array.isArray(jt?.data?.transactions)
          ? jt.data.transactions
          : [];
        // gắn wallet info
        all = all.concat(arr.map((t) => ({ ...t, _wallet: w })));
      }
      // Lọc theo khoảng thời gian
      const filtered = all.filter((t) => {
        const d = new Date(t.date || t.createdAt || 0);
        return d >= start && d <= end;
      });
      setTxns(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [range]);

  // Tính toán tổng/nhóm
  const totalBalance = useMemo(
    () => wallets.reduce((s, w) => s + (Number(w.balance) || 0), 0),
    [wallets]
  );

  const { incomeSum, expenseSum } = useMemo(() => {
    let inc = 0,
      exp = 0;
    for (const t of txns) {
      const amt = Number(t.amount || 0);
      const type = t.type || (amt >= 0 ? "income" : "expense");
      if (type === "expense") exp += Math.abs(amt);
      else inc += Math.abs(amt);
    }
    return { incomeSum: inc, expenseSum: exp };
  }, [txns]);

  // Bar "Tổng quan"
  const overviewData = useMemo(
    () => [
      { name: "Tổng thu", incomeSum },
      { name: "Tổng chi", expenseSum },
    ],
    [incomeSum, expenseSum]
  );

  // Donut "Chi tiền theo hạng mục"
  const expenseByCat = useMemo(() => {
    const map = new Map();
    txns.forEach((t) => {
      const amt = Number(t.amount || 0);
      const type = t.type || (amt >= 0 ? "income" : "expense");
      if (type !== "expense") return;
      const catId = t.categoryId || t.category || "";
      map.set(catId, (map.get(catId) || 0) + Math.abs(amt));
    });
    // đưa tên
    return Array.from(map.entries()).map(([catId, value]) => {
      const cat = expCats.find((c) => (c._id || c.id) === catId);
      return { name: cat?.name || "Khác", value };
    });
  }, [txns, expCats]);

  // Giao dịch gần đây (5 cái)
  const recent = useMemo(
    () =>
      [...txns].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [txns]
  );

  const COLORS = [
    "#ffb020",
    "#ff6b6b",
    "#4dabf7",
    "#63e6be",
    "#9775fa",
    "#fab005",
  ];

  return (
    <div className={styles.wrapper}>
      {/* hàng 1 */}
      <div className={styles.gridTwo}>
        <Card
          title="Tổng số dư"
          right={
            <button className={styles.iconBtn} onClick={load} title="Làm mới">
              <RotateCcw size={18} />
            </button>
          }
        >
          <div className={styles.bigNumber}>{fmtMoney(totalBalance)}</div>
        </Card>

        <Card
          title="Thu tiền"
          right={
            <button className={styles.iconBtn} onClick={load} title="Làm mới">
              <RotateCcw size={18} />
            </button>
          }
        >
          {incomeSum > 0 ? (
            <div className={styles.centerTextGreen}>{fmtMoney(incomeSum)}</div>
          ) : (
            <div className={styles.empty}>
              <Search size={26} />
              <span>Không có dữ liệu</span>
            </div>
          )}
        </Card>
      </div>

      {/* hàng 2 */}
      <div className={styles.gridTwo}>
        <Card
          title="Giao dịch gần đây"
          right={
            <button className={styles.iconBtn} onClick={load} title="Làm mới">
              <RotateCcw size={18} />
            </button>
          }
        >
          {recent.length === 0 ? (
            <div className={styles.empty}>
              <Search size={26} />
              <span>Không có dữ liệu</span>
            </div>
          ) : (
            <ul className={styles.txnList}>
              {recent.map((t) => {
                const amt = Number(t.amount || 0);
                const type = t.type || (amt >= 0 ? "income" : "expense");
                const sign = type === "expense" ? "-" : "+";
                const currency = t._wallet?.currency || "VND";
                const name =
                  t.categoryName ||
                  t.note ||
                  (type === "income" ? "Income" : "Expense");
                const d = new Date(t.date || Date.now());
                const dateStr = d.toLocaleDateString("vi-VN");
                return (
                  <li key={t._id || t.id} className={styles.txnItem}>
                    <span className={styles.txnIcon}>
                      <Book size={18} />
                    </span>
                    <div className={styles.txnMeta}>
                      <div className={styles.txnTitle}>{name}</div>
                      <div className={styles.txnDate}>{dateStr}</div>
                    </div>
                    <div
                      className={
                        type === "expense"
                          ? styles.amountRed
                          : styles.amountGreen
                      }
                    >
                      {sign}
                      {fmtMoney(Math.abs(amt), currency)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <ExpenseDonut />
      </div>

      {/* hàng 3 – Tổng quan */}
      <Card
        title="Tổng quan"
        right={
          <div className={styles.rowGap}>
            <select
              className={styles.select}
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="this-month">Tháng này</option>
              <option value="last-month">Tháng trước</option>
            </select>
            <button className={styles.iconBtn} onClick={load} title="Làm mới">
              <RotateCcw size={18} />
            </button>
          </div>
        }
      >
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={overviewData} barSize={42}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => fmtMoney(v)} />
              <Bar dataKey="incomeSum" radius={[8, 8, 0, 0]} fill="#2b8a3e" />
              <Bar dataKey="expenseSum" radius={[8, 8, 0, 0]} fill="#e03131" />
            </BarChart>
          </ResponsiveContainer>
          <div className={styles.overviewNums}>
            <div>
              <span className={styles.muted}>Tổng thu</span>
              <div className={styles.greenText}>{fmtMoney(incomeSum)}</div>
            </div>
            <div>
              <span className={styles.muted}>Tổng chi</span>
              <div className={styles.redText}>{fmtMoney(expenseSum)}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
