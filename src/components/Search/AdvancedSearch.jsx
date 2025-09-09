import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdvancedSearch.module.css";
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Wallet2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ================= helpers ================= */
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

function currencyFmt(amount, ccy = "VND") {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: ccy,
      maximumFractionDigits: ccy === "VND" ? 0 : 2,
    }).format(Number(amount || 0));
  } catch {
    return `${amount} ${ccy}`;
  }
}

/** Bỏ dấu tiếng Việt */
function stripVN(s = "") {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** Levenshtein distance (đo sai khác 2 chuỗi) */
function levenshtein(a = "", b = "") {
  if (a === b) return 0;
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/** Match bỏ dấu + fuzzy <= k.
 * - Ưu tiên includes (nhanh)
 * - Nếu không thấy, so word-wise (mỗi từ) với khoảng sai tối đa k
 */
function fuzzyMatch(desc, query, k = 2) {
  if (!query) return false;
  const A = stripVN(String(desc).toLowerCase());
  const Q = stripVN(String(query).toLowerCase().trim());
  if (!Q) return false;
  if (A.includes(Q)) return true;

  const words = A.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (Math.abs(w.length - Q.length) <= k && levenshtein(w, Q) <= k) {
      return true;
    }
  }
  return false;
}

/* ================= component ================= */

export default function AdvancedSearch() {
  const { state } = useAuth();
  const token = pickToken(state);
  const api = makeFetchAuth(token);

  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // search states
  const [query, setQuery] = useState("");
  const [tolerance, setTolerance] = useState(2);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // load wallets + all transactions (client gộp từ các ví)
  async function fetchAll() {
    setLoading(true);
    try {
      // 1) wallets
      const wRes = await api(`/api/v1/wallets`);
      const wJson = await wRes.json().catch(() => ({}));
      const ws = Array.isArray(wJson?.data?.wallets)
        ? wJson.data.wallets
        : Array.isArray(wJson)
        ? wJson
        : [];
      const wList = ws.map((w) => ({
        id: w._id || w.id,
        name: w.name,
        currency: w.currency || "VND",
      }));
      setWallets(wList);

      // 2) transactions per wallet (giới hạn 500/ ví cho demo)
      const all = [];
      for (const w of wList) {
        const tRes = await api(
          `/api/v1/transactions/wallet/${w.id}?page=1&limit=500&sort=-date`
        );
        const tJson = await tRes.json().catch(() => ({}));
        const arr = Array.isArray(tJson?.data?.transactions)
          ? tJson.data.transactions
          : [];
        for (const t of arr) {
          all.push({
            id: t._id || t.id,
            walletId: w.id,
            walletName: w.name,
            currency: w.currency || "VND",
            amount: t.amount,
            date: t.date || t.createdAt,
            description: t.description || t.note || "",
            type: t.type || (t.amount >= 0 ? "income" : "expense"),
          });
        }
      }

      // sort desc by date
      all.sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      );
      setTransactions(all);
      setPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filter by query (bỏ dấu + fuzzy <= tolerance)
  const filtered = useMemo(() => {
    if (!query.trim()) return transactions;
    return transactions.filter((t) =>
      fuzzyMatch(t.description, query, Number(tolerance) || 0)
    );
  }, [transactions, query, tolerance]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  function nextPage() {
    setPage((p) => Math.min(p + 1, totalPages));
  }
  function prevPage() {
    setPage((p) => Math.max(p - 1, 1));
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h3 className={styles.title}>
          <Search size={18} /> Tìm kiếm giao dịch
        </h3>
        <button className={styles.iconBtn} onClick={fetchAll} title="Làm mới">
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Bộ lọc */}
      <div className={styles.filters}>
        <div className={styles.field}>
          <label>Từ khoá (bỏ dấu, sai ≤ 2 ký tự)</label>
          <div className={styles.inputWrap}>
            <Search size={16} />
            <input
              className={styles.input}
              placeholder="Gõ để tìm theo mô tả giao dịch…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className={styles.fieldSmall}>
          <label>Sai tối đa</label>
          <select
            className={styles.select}
            value={tolerance}
            onChange={(e) => {
              setTolerance(e.target.value);
              setPage(1);
            }}
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>
      </div>

      {/* Kết quả */}
      <div className={styles.resultHead}>
        <span>
          {loading ? "Đang tải…" : `Tìm thấy ${filtered.length} giao dịch`}
        </span>
        {query ? (
          <span className={styles.hint}>
            Từ khoá: “<strong>{query}</strong>”, sai ≤ {tolerance}
          </span>
        ) : (
          <span className={styles.hint}>Hiển thị tất cả giao dịch</span>
        )}
      </div>

      <div className={styles.list}>
        {loading && <div className={styles.loading}>Đang tải dữ liệu…</div>}

        {!loading && paged.length === 0 && (
          <div className={styles.empty}>Không có giao dịch phù hợp.</div>
        )}

        {!loading &&
          paged.map((t) => (
            <div className={styles.item} key={t.id}>
              <div className={styles.left}>
                <div className={styles.iconWallet}>
                  <Wallet2 size={16} />
                </div>
                <div className={styles.meta}>
                  <div className={styles.desc} title={t.description}>
                    {t.description || "(không có mô tả)"}
                  </div>
                  <div className={styles.sub}>
                    {new Date(t.date).toLocaleString("vi-VN", {
                      hour12: false,
                    })}{" "}
                    • {t.walletName}
                  </div>
                </div>
              </div>

              <div
                className={`${styles.amount} ${
                  t.amount >= 0 ? styles.income : styles.expense
                }`}
                title={t.type}
              >
                {t.amount >= 0 ? "+" : ""}
                {currencyFmt(t.amount, t.currency)}
              </div>
            </div>
          ))}
      </div>

      {/* pagination */}
      {!loading && filtered.length > 0 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={prevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span className={styles.pageInfo}>
            Trang {currentPage}/{totalPages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={nextPage}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
