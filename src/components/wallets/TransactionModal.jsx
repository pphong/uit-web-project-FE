import React, { useEffect, useMemo, useState } from "react";
import styles from "./Wallets.module.css";
import {
  X,
  ChevronDown,
  Plus,
  Tag,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
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

function MiniModal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h4>{title}</h4>
          <button
            className={styles.iconBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ===== utils định dạng tiền ===== */
const formatMoney = (val) =>
  Number(String(val || "").replace(/[^\d]/g, "") || 0).toLocaleString("en-US");
const parseMoney = (val) =>
  Number(String(val || "").replace(/[^\d]/g, "") || 0);

export default function TransactionModal({
  open,
  mode = "create",
  initial = null,
  wallets = [],
  defaultWalletId,
  onClose,
  onSaved,
}) {
  const { state } = useAuth();
  const token = pickToken(state);
  const api = makeFetchAuth(token);

  const [type, setType] = useState("expense"); // "expense" | "income"
  const [categories, setCategories] = useState([]);

  // Cache toàn bộ labels: mảng phẳng và map theo categoryId
  const [allLabels, setAllLabels] = useState([]); // [{id, name, color, categoryId}]
  const [labelsByCategory, setLabelsByCategory] = useState({}); // { [categoryId]: Label[] }
  const [labels, setLabels] = useState([]); // labels đang hiển thị cho category đã chọn

  const [form, setForm] = useState({
    walletId: defaultWalletId || wallets[0]?.id || wallets[0]?._id || "",
    amount: "",
    categoryId: "",
    labelIds: [],
    note: "",
  });

  // Khi mở modal → init lại form
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setType(initial.type || "expense");
      setForm({
        walletId:
          initial.walletId ||
          defaultWalletId ||
          wallets[0]?.id ||
          wallets[0]?._id ||
          "",
        amount: formatMoney(Math.abs(initial.amount ?? 0)),
        categoryId: initial.categoryId || "",
        labelIds: Array.isArray(initial.labelIds) ? initial.labelIds : [],
        note: initial.note || initial.description || "",
      });
    } else {
      setType("expense");
      setForm({
        walletId: defaultWalletId || wallets[0]?.id || wallets[0]?._id || "",
        amount: "",
        categoryId: "",
        labelIds: [],
        note: "",
      });
    }
  }, [open, mode, initial, defaultWalletId, wallets]);

  // Đổi loại (chi/thu) → reset category & labels, rồi load categories của loại đó
  useEffect(() => {
    if (!open) return;
    setForm((s) => ({ ...s, categoryId: "", labelIds: [] }));
  }, [type, open]);

  // Lấy categories theo type
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await api(`/api/v1/categories/type/${type}`);
        const json = await res.json().catch(() => ({}));
        const arr = Array.isArray(json?.data?.categories)
          ? json.data.categories
          : [];
        setCategories(
          arr.map((c) => ({
            id: c._id || c.id,
            name: c.name,
            icon: c.icon || "tag",
          }))
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [type, open]);

  // Lấy TẤT CẢ labels (phân trang) một lần khi mở modal
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const pageSize = 100;
        let page = 1;
        let all = [];
        // loop pages
        // Nếu BE không hỗ trợ limit/page, lần đầu sẽ đủ
        while (true) {
          const res = await api(
            `/api/v1/labels?page=${page}&limit=${pageSize}`
          );
          const json = await res.json().catch(() => ({}));

          const pageLabels = json?.data?.labels ?? json?.labels ?? []; // tuỳ response

          all = all.concat(pageLabels);
          const total =
            json?.data?.pagination?.total ??
            json?.pagination?.total ??
            pageLabels.length;

          if (page * pageSize >= total || pageLabels.length === 0) break;
          page += 1;
        }

        const normalized = all.map((l) => ({
          id: l._id || l.id,
          name: l.name,
          color: l.color || "#999",
          // cố gắng bắt categoryId từ nhiều field khác nhau nếu BE đặt tên khác
          categoryId:
            l.categoryId ||
            l.category?.id ||
            l.category ||
            l.categoryID ||
            null,
        }));

        setAllLabels(normalized);

        // build index theo categoryId
        const byCat = normalized.reduce((acc, it) => {
          const key = it.categoryId || "__noCat";
          if (!acc[key]) acc[key] = [];
          acc[key].push(it);
          return acc;
        }, {});
        setLabelsByCategory(byCat);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [open]);

  // Khi đổi category → rút labels từ cache theo categoryId
  useEffect(() => {
    if (!open) return;
    if (!form.categoryId) {
      setLabels([]);
      setForm((s) => ({ ...s, labelIds: [] }));
      return;
    }
    const lst = labelsByCategory[form.categoryId] || [];
    setLabels(lst);
    // auto chọn 1 label nếu chưa có
    setForm((s) => {
      const keep = s.labelIds.filter((id) => lst.some((x) => x.id === id));
      return { ...s, labelIds: keep.length ? keep : lst[0] ? [lst[0].id] : [] };
    });
  }, [open, form.categoryId, labelsByCategory]);

  const wallet = useMemo(
    () => wallets.find((w) => (w.id || w._id) === form.walletId),
    [wallets, form.walletId]
  );

  const canSave =
    form.walletId &&
    parseMoney(form.amount) > 0 &&
    form.categoryId &&
    form.labelIds.length > 0;

  const onChangeAmount = (e) => {
    const formatted = formatMoney(e.target.value);
    setForm((s) => ({ ...s, amount: formatted === "0" ? "" : formatted }));
  };
  const handle = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };
  const toggleLabel = (id) => {
    setForm((s) => {
      const has = s.labelIds.includes(id);
      return {
        ...s,
        labelIds: has
          ? s.labelIds.filter((x) => x !== id)
          : [...s.labelIds, id],
      };
    });
  };

  async function submit(e, keepOpen = false) {
    e.preventDefault();
    if (!canSave) return;

    try {
      const raw = parseMoney(form.amount);
      const payload = {
        amount: type === "income" ? Math.abs(raw) : raw * -1,
        type, // "expense" | "income" — BE sẽ hiểu cộng/trừ
        currency: wallet?.currency || "VND",
        description:
          form.note?.trim() ||
          (type === "income" ? "Income transaction" : "Expense transaction"),
        labels: form.labelIds, // BẮT BUỘC >= 1
        categoryId: form.categoryId,
        date: new Date().toISOString(), // không cho sửa trong UI
      };

      console.log("Check payload", payload);

      const url =
        mode === "create"
          ? `/api/v1/transactions/wallet/${form.walletId}`
          : `/api/v1/transactions/${initial?.id || initial?._id}`;

      const res = await api(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

      onSaved?.({ walletId: form.walletId });

      if (keepOpen && mode === "create") {
        setForm((s) => ({ ...s, amount: "", note: "" }));
      } else {
        onClose?.();
      }
    } catch (err) {
      alert(err.message || "Lưu giao dịch thất bại");
    }
  }

  return (
    <MiniModal
      open={open}
      title={mode === "create" ? "Thêm ghi chép" : "Sửa ghi chép"}
      onClose={onClose}
    >
      <form className={styles.form} onSubmit={(e) => submit(e, false)}>
        {/* Loại giao dịch */}
        <div className={styles.typeSwitch}>
          <button
            type="button"
            className={`${styles.typeBtn} ${
              type === "expense" ? styles.typeActive : ""
            }`}
            onClick={() => setType("expense")}
          >
            <ArrowDownCircle size={18} /> Chi tiêu
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${
              type === "income" ? styles.typeActive : ""
            }`}
            onClick={() => setType("income")}
          >
            <ArrowUpCircle size={18} /> Thu tiền
          </button>
        </div>

        <div className={styles.formGrid}>
          {/* Số tiền */}
          <div className={styles.field}>
            <label>Số tiền *</label>
            <input
              className={styles.input}
              name="amount"
              inputMode="numeric"
              value={form.amount}
              onChange={onChangeAmount}
              placeholder="0"
              required
            />
          </div>

          {/* Hạng mục */}
          <div className={styles.field}>
            <label>Hạng mục *</label>
            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                name="categoryId"
                value={form.categoryId}
                onChange={handle}
                required
              >
                <option value="">Lựa chọn</option>
                {categories.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className={styles.chev} />
            </div>

            {/* gợi ý nhanh (chips) */}
            <div className={styles.quickChips}>
              {categories.slice(0, 6).map((c) => (
                <button
                  type="button"
                  key={`chip-${c.id}`}
                  className={`${styles.chip} ${
                    form.categoryId === c.id ? styles.chipActive : ""
                  }`}
                  onClick={() => setForm((s) => ({ ...s, categoryId: c.id }))}
                >
                  <Tag size={14} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tài khoản (ví) */}
          <div className={styles.field}>
            <label>Tài khoản *</label>
            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                name="walletId"
                value={form.walletId}
                onChange={handle}
                required
              >
                {wallets.map((w) => {
                  const id = w.id || w._id;
                  return (
                    <option key={id} value={id}>
                      {w.name} ({w.currency})
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={16} className={styles.chev} />
            </div>
          </div>

          {/* Diễn giải */}
          <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <label>Diễn giải</label>
            <textarea
              className={styles.textarea}
              name="note"
              rows={4}
              value={form.note}
              onChange={handle}
              placeholder="Nhập diễn giải"
            />
          </div>

          {/* Labels theo category (từ cache) */}
          {/* Labels theo category (từ cache) */}
          <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <label>Label *</label>

            {!form.categoryId ? (
              <div className={styles.emptySmall}>
                Vui lòng chọn hạng mục để hiển thị label.
              </div>
            ) : labels.length === 0 ? (
              <div className={styles.emptySmall}>
                Hạng mục này chưa có nhãn — vào “Quản lý danh mục” để thêm.
              </div>
            ) : (
              <div className={styles.labelsBox}>
                {labels.map((l) => {
                  const active = form.labelIds.includes(l.id);
                  return (
                    <button
                      type="button"
                      key={l.id}
                      className={`${styles.pill} ${
                        active ? styles.pillOn : ""
                      }`}
                      onClick={() => toggleLabel(l.id)}
                      title={l.name}
                    >
                      <span
                        className={styles.pillDot}
                        style={{ backgroundColor: l.color || "#9CA3AF" }}
                      />
                      {l.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            Huỷ
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={!canSave}
            onClick={(e) => submit(e)}
          >
            Lưu lại
          </button>
        </div>
      </form>
    </MiniModal>
  );
}
