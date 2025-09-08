import React, { useEffect, useMemo, useState } from "react";
import styles from "./Wallets.module.css";
import {
  X,
  Wallet2,
  Coins,
  Plus,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Clock4,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import TransactionModal from "./TransactionModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ===== helpers ===== */
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

const INCOME_LABEL_NAME_HINT = /(lương|salary|thu|deposit|top ?up|nạp)/i;

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

const fmtNumber = (v) =>
  (v ?? "") === ""
    ? ""
    : new Intl.NumberFormat("vi-VN").format(
        Number(String(v).replace(/\D/g, ""))
      );
const parseNumber = (s) =>
  Number(
    String(s || "0")
      .replaceAll(".", "")
      .replaceAll(",", "")
  );

/* ===================================================== */

export default function WalletManager() {
  const { state } = useAuth();
  const token = pickToken(state);
  const api = makeFetchAuth(token);

  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [defaultWalletId, setDefaultWalletId] = useState(null);

  // labels cache để luôn có 1 id hợp lệ dùng cho transaction
  const [allLabels, setAllLabels] = useState([]);

  // Transaction modal (ghi chép thường)
  const [openTxn, setOpenTxn] = useState(false);
  const [txnMode] = useState("create");
  const [txnInitial, setTxnInitial] = useState(null);

  // Wallet modal
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const [walletMode, setWalletMode] = useState("create");
  const [savingWallet, setSavingWallet] = useState(false);
  const [walletForm, setWalletForm] = useState({
    name: "",
    currency: "VND",
    description: "",
    initialBalance: "",
    isDefault: false,
  });

  // Quick top-up modal (giả lập chuyển vào ví)
  const [openTopup, setOpenTopup] = useState(false);
  const [topupWallet, setTopupWallet] = useState(null);
  const [topupAmount, setTopupAmount] = useState(""); // formatted string
  const [topupNote, setTopupNote] = useState("Nạp tiền");

  console.log(defaultWalletId);

  /* ---------------- fetchers ---------------- */
  async function fetchWallets() {
    setLoading(true);
    try {
      const res = await api(`/api/v1/wallets`);
      const json = await res.json().catch(() => ({}));

      const arr = Array.isArray(json?.data?.wallets)
        ? json.data.wallets
        : Array.isArray(json)
        ? json
        : [];

      const list = arr.map((w) => ({
        id: w._id || w.id,
        name: w.name,
        currency: w.currency || "VND",
        description: w.description || "",
        // server trả balance hiện tại
        balance: w.balance ?? w.currentBalance ?? 0,
        isDefault: Boolean(w.isDefault),
      }));

      setWallets(list);
      const def = list.find((w) => w.isDefault)?.id || list[0]?.id || null;
      setDefaultWalletId(def);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLabels() {
    try {
      const res = await api(`/api/v1/labels`);
      const json = await res.json().catch(() => ({}));
      const list = Array.isArray(json?.data?.labels)
        ? json.data.labels
        : json?.labels || [];
      setAllLabels(list);
    } catch (e) {
      console.warn("Fetch labels failed", e);
    }
  }

  useEffect(() => {
    fetchWallets();
    fetchLabels();
  }, []);

  /* ------------- ensure 1 label id for income ------------- */
  async function ensureIncomeLabelId() {
    // ưu tiên label tên có hint “lương / salary / nạp / top up / deposit…”
    let lbl =
      allLabels.find((l) => INCOME_LABEL_NAME_HINT.test(l.name || "")) ||
      allLabels[0];

    if (lbl) return lbl._id || lbl.id;

    // nếu người dùng chưa có label nào → tạo label “Top up”
    try {
      const res = await api(`/api/v1/labels`, {
        method: "POST",
        body: JSON.stringify({
          name: "Top up",
          color: "#2F80ED",
          icon: "ArrowUpRight",
          description: "Auto-created for deposits",
        }),
      });
      const json = await res.json().catch(() => ({}));
      const created = json?.data?.label || json?.label;
      if (created) {
        await fetchLabels();
        return created._id || created.id;
      }
    } catch (e) {
      console.warn("Create fallback label failed", e);
    }
    return undefined; // vẫn gửi mảng rỗng được nếu BE không bắt buộc
  }

  /* ---------------- CRUD ví ---------------- */
  const openCreateWallet = () => {
    setWalletMode("create");
    setWalletForm({
      name: "",
      currency: "VND",
      description: "",
      initialBalance: "",
      isDefault: wallets.length === 0,
    });
    setOpenWalletModal(true);
  };

  const openEditWallet = (w) => {
    setWalletMode("edit");
    setWalletForm({
      name: w.name,
      currency: w.currency,
      description: w.description || "",
      initialBalance: "", // không dùng khi edit
      isDefault: Boolean(w.isDefault),
    });
    setOpenWalletModal(true);
  };

  async function createIncomeTxn(walletId, amount, note = "Nạp tiền") {
    const labelId = await ensureIncomeLabelId();
    const payload = {
      amount: Math.abs(amount), // income → dương
      currency: wallets.find((w) => w.id === walletId)?.currency || "VND",
      description: note,
      receiver: "Top up",
      labels: labelId ? [labelId] : [], // BE đang require, nên hầu như luôn có 1 id ở đây
      type: "income",
      date: new Date().toISOString(),
    };

    const res = await api(`/api/v1/transactions/wallet/${walletId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  }

  async function saveWallet(e) {
    e.preventDefault();
    if (savingWallet) return;
    setSavingWallet(true);

    try {
      if (walletMode === "create") {
        // 1) tạo ví
        const res = await api(`/api/v1/wallets`, {
          method: "POST",
          body: JSON.stringify({
            name: walletForm.name,
            currency: walletForm.currency,
            description: walletForm.description,
            isDefault: walletForm.isDefault,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

        const created = data?.data?.wallet || data?.wallet || data;
        const newId = created?._id || created?.id;

        // 2) nếu có số dư ban đầu → nạp tiền (income)
        const init = parseNumber(walletForm.initialBalance);
        if (newId && init > 0) {
          await createIncomeTxn(newId, init, "Nạp tiền (số dư ban đầu)");
        }
      } else {
        // EDIT ví (không đụng tới số dư)
        const target =
          wallets.find((w) => w.name === walletForm.name) || wallets[0];
        const res = await api(`/api/v1/wallets/${target.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: walletForm.name,
            currency: walletForm.currency,
            description: walletForm.description,
            isDefault: walletForm.isDefault,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      }

      setOpenWalletModal(false);
      await fetchWallets();
    } catch (err) {
      alert(err.message || "Lưu ví thất bại");
    } finally {
      setSavingWallet(false);
    }
  }

  async function deleteWallet(w) {
    if (!window.confirm(`Xoá ví “${w.name}”?`)) return;
    try {
      const res = await api(`/api/v1/wallets/${w.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      await fetchWallets();
    } catch (e) {
      alert(e.message || "Xoá thất bại");
    }
  }

  async function setDefault(w) {
    try {
      const res = await api(`/api/v1/wallets/${w.id}/set-default`, {
        method: "PATCH",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      await fetchWallets();
    } catch (e) {
      alert(e.message || "Thiết lập mặc định thất bại");
    }
  }

  /* -------------- Giao dịch gần đây -------------- */
  const [expandedId, setExpandedId] = useState(null);
  const [recentTxns, setRecentTxns] = useState({});
  async function toggleRecent(w) {
    if (expandedId === w.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(w.id);
    try {
      const res = await api(
        `/api/v1/transactions/wallet/${w.id}?page=1&limit=8&sort=-date`
      );
      const json = await res.json().catch(() => ({}));
      const list =
        Array.isArray(json?.data?.transactions) && json.data.transactions
          ? json.data.transactions
          : [];
      console.log("Check tất cả giao dịch", list);
      setRecentTxns((m) => ({ ...m, [w.id]: list }));
    } catch (e) {
      console.error(e);
    }
  }

  /* -------------- Quick top-up -------------- */
  function openTopupFor(w, preset = "") {
    setTopupWallet(w);
    setTopupAmount(fmtNumber(preset));
    setTopupNote("Nạp tiền");
    setOpenTopup(true);
  }

  async function submitTopup(e) {
    e.preventDefault();
    const amt = parseNumber(topupAmount);
    if (!topupWallet || amt <= 0) return;
    try {
      await createIncomeTxn(topupWallet.id, amt, topupNote || "Nạp tiền");
      setOpenTopup(false);
      await fetchWallets();
    } catch (err) {
      alert(err.message || "Nạp tiền thất bại");
    }
  }

  /* ===================================================== */

  return (
    <div className={styles.page}>
      <div className={styles.walletHeader}>
        <h3 className={styles.title}>
          <Wallet2 size={20} /> Quản lý ví
        </h3>
        <button className={styles.btnPrimary} onClick={openCreateWallet}>
          <Plus size={16} /> Thêm ví
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải ví…</div>
      ) : wallets.length === 0 ? (
        <div className={styles.empty}>Chưa có ví nào. Nhấn “Thêm ví”.</div>
      ) : (
        <div className={styles.walletGrid}>
          {wallets.map((w) => (
            <div className={styles.walletCard} key={w.id}>
              <div className={styles.walletHead}>
                <div className={styles.walletIcon}>
                  <Coins size={18} />
                </div>

                <div className={styles.walletInfo}>
                  <div className={styles.walletName}>
                    {w.name}{" "}
                    {w.isDefault && (
                      <span className={styles.badge}>
                        <Star size={12} /> Mặc định
                      </span>
                    )}
                  </div>
                  <div className={styles.walletDesc}>
                    {w.currency} • Số dư:{" "}
                    <strong>{currencyFmt(w.balance, w.currency)}</strong>
                  </div>
                </div>

                <div className={styles.rowActions}>
                  {w.isDefault ? (
                    <button
                      className={styles.iconBtn}
                      title="Bỏ mặc định"
                      disabled
                    >
                      <StarOff size={18} />
                    </button>
                  ) : (
                    <button
                      className={styles.iconBtn}
                      onClick={() => setDefault(w)}
                      title="Đặt mặc định"
                    >
                      <Star size={18} />
                    </button>
                  )}

                  <button
                    className={styles.iconBtn}
                    onClick={() => openEditWallet(w)}
                    title="Sửa ví"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    className={styles.iconBtn}
                    onClick={() => deleteWallet(w)}
                    title="Xoá ví"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.walletActions}>
                <button
                  className={styles.btnSoft}
                  onClick={() => {
                    setTxnInitial(null);
                    setOpenTxn(true);
                    setDefaultWalletId(w.id);
                  }}
                >
                  <Plus size={16} /> Thêm ghi chép
                </button>

                <button
                  className={styles.btnGhost}
                  onClick={() => toggleRecent(w)}
                  title="Giao dịch gần đây"
                >
                  <Clock4 size={16} /> Giao dịch gần đây
                </button>

                <button
                  className={styles.btnGhost}
                  onClick={() => openTopupFor(w)}
                  title="Nạp tiền vào ví"
                >
                  Nạp tiền
                </button>
              </div>

              {expandedId === w.id && (
                <div className={styles.recentList}>
                  {(recentTxns[w.id] || []).map((t) => (
                    <div className={styles.txnRow} key={t._id || t.id}>
                      <span className={styles.txnText}>
                        {"Mô tả giao dịch: " + t.description}
                        {" - "}
                        <strong className={styles.txnDate}>
                          {"Thời gian thực hiện:  " +
                            new Date(t.createdAt).toLocaleString("vi-VN", {
                              hour12: false,
                            })}
                        </strong>
                      </span>
                      <span
                        className={styles.txnAmount}
                        data-type={t.amount > 0 ? "income" : "expense"}
                        title={t.type}
                      >
                        {currencyFmt(t.amount, w.currency)}
                      </span>
                    </div>
                  ))}
                  {(recentTxns[w.id] || []).length === 0 && (
                    <div className={styles.emptySmall}>Chưa có giao dịch.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wallet modal */}
      {openWalletModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setOpenWalletModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h4>{walletMode === "create" ? "Thêm ví" : "Sửa ví"}</h4>
              <button
                className={styles.iconBtn}
                onClick={() => setOpenWalletModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form className={styles.form} onSubmit={saveWallet}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Tên ví *</label>
                  <input
                    className={styles.input}
                    value={walletForm.name}
                    onChange={(e) =>
                      setWalletForm((s) => ({ ...s, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <label>Mô tả</label>
                  <input
                    className={styles.input}
                    value={walletForm.description}
                    onChange={(e) =>
                      setWalletForm((s) => ({
                        ...s,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* <div className={styles.fieldInline}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={walletForm.isDefault}
                      onChange={(e) =>
                        setWalletForm((s) => ({
                          ...s,
                          isDefault: e.target.checked,
                        }))
                      }
                    />
                    <span>Đặt làm mặc định</span>
                  </label>
                </div> */}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setOpenWalletModal(false)}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={savingWallet}
                >
                  {savingWallet ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Top-up modal */}
      {openTopup && topupWallet && (
        <div
          className={styles.modalOverlay}
          onClick={() => setOpenTopup(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h4>Nạp tiền vào “{topupWallet.name}”</h4>
              <button
                className={styles.iconBtn}
                onClick={() => setOpenTopup(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form className={styles.form} onSubmit={submitTopup}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Số tiền *</label>
                  <input
                    className={styles.input}
                    inputMode="numeric"
                    required
                    placeholder="VD: 500,000"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(fmtNumber(e.target.value))}
                  />
                </div>

                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <label>Ghi chú</label>
                  <input
                    className={styles.input}
                    value={topupNote}
                    onChange={(e) => setTopupNote(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setOpenTopup(false)}
                >
                  Huỷ
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Nạp tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction modal (ghi chép chuẩn) */}
      <TransactionModal
        open={openTxn}
        mode={txnMode}
        initial={txnInitial}
        wallets={wallets}
        defaultWalletId={defaultWalletId}
        onClose={() => setOpenTxn(false)}
        onSaved={fetchWallets}
      />
    </div>
  );
}
