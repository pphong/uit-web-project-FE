import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RotateCw } from "lucide-react";
import styles from "./ExpenseDonut.module.css";
import { useAuth } from "../../contexts/AuthContext";

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

const COLORS = [
  "#FF9800",
  "#03A9F4",
  "#E91E63",
  "#4CAF50",
  "#9C27B0",
  "#FF5722",
  "#009688",
  "#795548",
  "#607D8B",
  "#8BC34A",
];

function currencyFmt(amount, ccy = "VND") {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: ccy === "VND" ? "VND" : ccy,
      maximumFractionDigits: ccy === "VND" ? 0 : 2,
    }).format(Number(amount || 0));
  } catch {
    return `${amount} ${ccy}`;
  }
}

// đầu – cuối tháng hiện tại
function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export default function ExpenseDonut() {
  const { state } = useAuth();
  const token = pickToken(state);
  const api = makeFetchAuth(token);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // {name, value}
  const [total, setTotal] = useState(0);

  async function fetchData() {
    setLoading(true);
    try {
      // 1) Lấy ví
      const ws = await api(`/api/v1/wallets`);
      const wsJson = await ws.json().catch(() => ({}));
      const wallets = Array.isArray(wsJson?.data?.wallets)
        ? wsJson.data.wallets
        : Array.isArray(wsJson)
        ? wsJson
        : [];

      if (wallets.length === 0) {
        setData([]);
        setTotal(0);
        return;
      }

      console.log("Check wallets", wallets);

      // 2) Lấy danh mục chi để map tên
      const catRes = await api(`/api/v1/categories/type/expense`);
      const catJson = await catRes.json().catch(() => ({}));
      const catMap = {};
      (catJson?.data?.categories || []).forEach((c) => {
        catMap[c._id || c.id] = c.name || "Không rõ";
      });

      console.log("Check category", catJson);

      // 3) Gom giao dịch tháng này theo categoryId
      const { start, end } = monthRange();
      const g = new Map(); // key: categoryId -> sum

      for (const w of wallets) {
        const wId = w._id || w.id;
        // lấy nhiều nhất có thể 1k record — nếu BE có filter date bạn gắn thêm query vào nhé
        const res = await api(
          `/api/v1/transactions/wallet/${wId}?page=1&limit=1000&sort=-date`
        );
        const json = await res.json().catch(() => ({}));
        const list = Array.isArray(json?.data?.transactions)
          ? json.data.transactions
          : Array.isArray(json)
          ? json
          : [];

        for (const t of list) {
          // lọc trong tháng + là expense
          const d = new Date(t.date || t.createdAt || Date.now());
          if (d < start || d > end) continue;

          // chuẩn hoá kiểu expense -> số âm (nếu dữ liệu cũ là dương)
          const isExpense = t.type === "expense" || Number(t.amount) < 0;
          if (!isExpense) continue;

          const amt = Math.abs(Number(t.amount || 0));
          const catId = t.categoryId || t.category || "other";
          g.set(catId, (g.get(catId) || 0) + amt);
        }
      }

      // 4) Build data cho chart
      const arr = Array.from(g.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([catId, sum]) => ({ name: catMap[catId] || "Khác", value: sum }));

      setData(arr);
      setTotal(arr.reduce((s, i) => s + i.value, 0));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h3>Chi tiền</h3>
        <button
          className={styles.iconBtn}
          onClick={fetchData}
          title="Làm mới"
          disabled={loading}
        >
          <RotateCw size={18} />
        </button>
      </div>

      <div className={styles.cardBody}>
        {loading ? (
          <div className={styles.cardEmpty}>Đang tải…</div>
        ) : data.length === 0 ? (
          <div className={styles.cardEmpty}>Không có dữ liệu</div>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={120}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [currencyFmt(v), n]}
                  separator=" "
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* tổng ở giữa donut (dễ đọc) */}
            <div className={styles.donutCenter}>
              <div className={styles.donutTotalLabel}>Tổng chi</div>
              <div className={styles.donutTotal}>{currencyFmt(total)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
