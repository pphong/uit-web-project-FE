// src/components/CategoryLabelManager/CategoryLabelManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./CategoryLabelManager.module.css";
import { useAuth } from "../../contexts/AuthContext";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  ChevronDown,
  Check,
  Utensils,
  Coffee,
  ShoppingBag,
  Car,
  Baby,
  GraduationCap,
  Home,
  HeartPulse,
  Dumbbell,
  Gamepad2,
  Gift,
  PiggyBank,
  Bus,
  BookOpen,
  Shield,
  Tag,
} from "lucide-react";

/* ================== Config ================== */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const UNASSIGNED = "__UNASSIGNED__"; // gom label chưa gán category

/* ================== Icons ================== */
const ICON_OPTIONS = [
  { name: "utensils", label: "Ăn uống", Icon: Utensils },
  { name: "coffee", label: "Cafe", Icon: Coffee },
  { name: "shopping", label: "Mua sắm", Icon: ShoppingBag },
  { name: "car", label: "Xe cộ", Icon: Car },
  { name: "baby", label: "Con cái", Icon: Baby },
  { name: "education", label: "Giáo dục", Icon: GraduationCap },
  { name: "home", label: "Nhà cửa", Icon: Home },
  { name: "health", label: "Sức khoẻ", Icon: HeartPulse },
  { name: "sport", label: "Thể thao", Icon: Dumbbell },
  { name: "game", label: "Giải trí", Icon: Gamepad2 },
  { name: "gift", label: "Quà tặng", Icon: Gift },
  { name: "saving", label: "Tiết kiệm", Icon: PiggyBank },
  { name: "bus", label: "Đi lại", Icon: Bus },
  { name: "book", label: "Sách vở", Icon: BookOpen },
  { name: "insurance", label: "Bảo hiểm", Icon: Shield },
];

const IconByName = ({ name, size = 18 }) => {
  const found = ICON_OPTIONS.find((i) => i.name === name);
  const I = found?.Icon || Tag;
  return <I size={size} />;
};

/* ================== Auth helpers ================== */
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

const normCat = (c = {}, typeHint = "") => ({
  id: c._id || c.id,
  name: c.name || "",
  type: (c.type || typeHint || "").toLowerCase(), // server có data.type
  icon: c.icon || "tag",
  color: c.color || "#eaf6ff",
});

const normLabel = (l = {}) => ({
  id: l._id || l.id,
  name: l.name || "",
  icon: l.icon || "tag",
  color: l.color || "#cfe9ff",
  categoryId: l.categoryId ?? UNASSIGNED, // null => gom vào nhóm gợi ý
});

/* ================== Mini Modal ================== */
function MiniModal({ open, title, children, onClose }) {
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

/* ================== Main Component ================== */
export default function CategoryLabelManager({ open = true }) {
  const { state, logout } = useAuth();
  const token = pickToken(state);
  const api = makeFetchAuth(token);

  const [activeType, setActiveType] = useState("expense"); // expense | income
  const [cats, setCats] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  // ------- fetch categories theo type -------
  async function fetchCategoriesByType(type) {
    const res = await api(`/api/v1/categories/type/${type}`);
    if (res.status === 401) {
      await logout?.();
      window.location.replace("/login");
      return [];
    }
    const json = await res.json().catch(() => ({}));
    const list = Array.isArray(json?.data?.categories)
      ? json.data.categories
      : [];
    const typeInfo = (json?.data?.type || type || "").toLowerCase();
    return list.map((c) => normCat(c, typeInfo));
  }

  // ------- fetch toàn bộ labels (theo pagination) -------
  async function fetchAllLabels() {
    let page = 1;
    const out = [];
    while (true) {
      const res = await api(`/api/v1/labels?page=${page}`);
      if (res.status === 401) {
        await logout?.();
        window.location.replace("/login");
        return [];
      }
      const json = await res.json().catch(() => ({}));
      console.log("Check labels 2", json);
      const chunk = Array.isArray(json?.data?.labels) ? json.data.labels : [];
      out.push(...chunk);
      const pg = json?.data?.pagination || {};
      const now = Number(pg.page ?? page);
      const totalPages = Number(pg.pages ?? 1);
      if (!totalPages || now >= totalPages) break;
      page = now + 1;
    }
    return out.map(normLabel);
  }

  // ------- load dữ liệu (token-gated) -------
  useEffect(() => {
    if (!open || !token) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [cList, lList] = await Promise.all([
          fetchCategoriesByType(activeType),
          fetchAllLabels(),
        ]);

        // có label chưa gán => thêm card ảo "Label gợi ý"
        const hasUnassigned = lList.some((l) => l.categoryId === UNASSIGNED);
        const catList = hasUnassigned
          ? [
              {
                id: UNASSIGNED,
                name: "Label gợi ý",
                type: activeType,
                icon: "tag",
                color: "#f1f5f9",
              },
              ...cList,
            ]
          : cList;

        if (!cancelled) {
          setCats(catList);
          setLabels(lList);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, token, activeType]);

  // ------- group labels theo category -------
  const labelsByCategory = useMemo(() => {
    const map = new Map();
    for (const lb of labels) {
      const key = lb.categoryId || UNASSIGNED;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(lb);
    }
    return map;
  }, [labels]);

  /* ========== Category CRUD ========== */
  const [catModal, setCatModal] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [catForm, setCatForm] = useState({
    name: "",
    type: "expense",
    icon: "utensils",
    color: "#08b3ff",
  });
  const [savingCat, setSavingCat] = useState(false);

  const openCreateCat = () => {
    setCatForm({
      name: "",
      type: activeType,
      icon: "utensils",
      color: "#08b3ff",
    });
    setCatModal({ open: true, mode: "create", data: null });
  };
  const openEditCat = (c) => {
    setCatForm({
      name: c.name || "",
      type: c.type || "expense",
      icon: c.icon || "utensils",
      color: c.color || "#08b3ff",
    });
    setCatModal({ open: true, mode: "edit", data: c });
  };

  async function submitCat(e) {
    e.preventDefault();
    if (savingCat) return;
    setSavingCat(true);
    try {
      if (catModal.mode === "create") {
        const r = await api(`/api/v1/categories`, {
          method: "POST",
          body: JSON.stringify(catForm),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.message || `HTTP ${r.status}`);
      } else {
        const id = catModal.data.id;
        const r = await api(`/api/v1/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify(catForm),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.message || `HTTP ${r.status}`);
      }
      setCatModal({ open: false, mode: "create", data: null });
      // reload categories theo type mới
      const list = await fetchCategoriesByType(catForm.type);
      setCats((prev) => {
        const keepUnassigned = prev.some((c) => c.id === UNASSIGNED);
        return keepUnassigned
          ? [
              {
                id: UNASSIGNED,
                name: "Label gợi ý",
                type: catForm.type,
                icon: "tag",
                color: "#f1f5f9",
              },
              ...list,
            ]
          : list;
      });
      setActiveType(catForm.type);
    } catch (err) {
      alert(err.message || "Lỗi lưu thể loại");
    } finally {
      setSavingCat(false);
    }
  }

  async function deleteCat(c) {
    if (!window.confirm(`Xoá thể loại “${c.name}”?`)) return;
    try {
      const r = await api(`/api/v1/categories/${c.id}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.message || `HTTP ${r.status}`);
      const list = await fetchCategoriesByType(activeType);
      setCats((prev) => {
        const keepUnassigned = prev.some((x) => x.id === UNASSIGNED);
        return keepUnassigned
          ? [
              {
                id: UNASSIGNED,
                name: "Label gợi ý",
                type: activeType,
                icon: "tag",
                color: "#f1f5f9",
              },
              ...list,
            ]
          : list;
      });
    } catch (e) {
      alert(e.message || "Xoá thất bại");
    }
  }

  /* ========== Label CRUD ========== */
  const [labModal, setLabModal] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [labForm, setLabForm] = useState({
    name: "",
    categoryId: "",
    icon: "coffee",
    color: "#0ea5e9",
  });
  const [savingLab, setSavingLab] = useState(false);

  const openCreateLabel = (category) => {
    const categoryId = category?.id === UNASSIGNED ? "" : category?.id;
    setLabForm({ name: "", categoryId, icon: "coffee", color: "#0ea5e9" });
    setLabModal({ open: true, mode: "create", data: null });
  };
  const openEditLabel = (label) => {
    setLabForm({
      name: label.name || "",
      categoryId: label.categoryId === UNASSIGNED ? "" : label.categoryId,
      icon: label.icon || "coffee",
      color: label.color || "#0ea5e9",
    });
    setLabModal({ open: true, mode: "edit", data: label });
  };

  async function reloadAllLabelsIntoState() {
    const lList = await fetchAllLabels();
    setLabels(lList);
  }

  async function submitLabel(e) {
    e.preventDefault();
    if (savingLab) return;
    setSavingLab(true);
    try {
      if (labModal.mode === "create") {
        const r = await api(`/api/v1/labels`, {
          method: "POST",
          body: JSON.stringify(labForm),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.message || `HTTP ${r.status}`);
      } else {
        const id = labModal.data.id;
        const r = await api(`/api/v1/labels/${id}`, {
          method: "PUT",
          body: JSON.stringify(labForm),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.message || `HTTP ${r.status}`);
      }
      setLabModal({ open: false, mode: "create", data: null });
      await reloadAllLabelsIntoState();
    } catch (e) {
      alert(e.message || "Lỗi lưu label");
    } finally {
      setSavingLab(false);
    }
  }

  async function deleteLabel(label) {
    if (!window.confirm(`Xoá label “${label.name}”?`)) return;
    try {
      const r = await api(`/api/v1/labels/${label.id}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.message || `HTTP ${r.status}`);
      await reloadAllLabelsIntoState();
    } catch (e) {
      alert(e.message || "Xoá thất bại");
    }
  }

  /* ================== UI ================== */
  if (!open) return null;

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.headerRow}>
          <div className={styles.tabs}>
            {["expense", "income"].map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${
                  activeType === t ? styles.tabActive : ""
                }`}
                onClick={() => setActiveType(t)}
              >
                {t === "expense" ? "Chi tiêu" : "Thu tiền"}
              </button>
            ))}
          </div>

          <div className={styles.headerActions}>
            <button className={styles.btnPrimary} onClick={openCreateCat}>
              <Plus size={18} /> Thêm thể loại
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {loading ? (
            <div className={styles.loading}>Đang tải dữ liệu…</div>
          ) : cats.length === 0 ? (
            <div className={styles.empty}>
              Chưa có thể loại nào. Nhấn “Thêm thể loại”.
            </div>
          ) : (
            cats.map((c) => {
              const list = labelsByCategory.get(c.id) || [];
              return (
                <div className={styles.card} key={c.id}>
                  <div className={styles.cardHead}>
                    <div
                      className={styles.catIcon}
                      style={{ background: c.color || "#eaf6ff" }}
                    >
                      <IconByName name={c.icon} size={20} />
                    </div>
                    <div className={styles.catInfo}>
                      <div className={styles.catName}>{c.name}</div>
                      <div className={styles.catType}>
                        {c.type === "income" ? "Thu tiền" : "Chi tiêu"}
                      </div>
                    </div>
                    {c.id !== UNASSIGNED && (
                      <div className={styles.rowActions}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => openEditCat(c)}
                          title="Sửa"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className={styles.iconBtn}
                          onClick={() => deleteCat(c)}
                          title="Xoá"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.labels}>
                    {list.map((lb) => (
                      <div className={styles.labelChip} key={lb.id}>
                        <span
                          className={styles.dot}
                          style={{ background: lb.color || "#cfe9ff" }}
                        />
                        <IconByName name={lb.icon} size={16} />
                        <span className={styles.labelText}>{lb.name}</span>
                        <button
                          className={styles.chipBtn}
                          onClick={() => openEditLabel(lb)}
                          title="Sửa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className={styles.chipBtn}
                          onClick={() => deleteLabel(lb)}
                          title="Xoá"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className={styles.cardFoot}>
                    <button
                      className={styles.btnSoft}
                      onClick={() => openCreateLabel(c)}
                    >
                      <Plus size={16} /> Thêm label
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ===== Modal Category ===== */}
        <MiniModal
          open={catModal.open}
          title={catModal.mode === "create" ? "Thêm thể loại" : "Sửa thể loại"}
          onClose={() =>
            setCatModal({ open: false, mode: "create", data: null })
          }
        >
          <form className={styles.form} onSubmit={submitCat}>
            <div className={styles.formRow}>
              <label>Tên *</label>
              <input
                className={styles.input}
                value={catForm.name}
                onChange={(e) =>
                  setCatForm((s) => ({ ...s, name: e.target.value }))
                }
                required
              />
            </div>

            <div className={styles.formRow}>
              <label>Loại *</label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={catForm.type}
                  onChange={(e) =>
                    setCatForm((s) => ({ ...s, type: e.target.value }))
                  }
                >
                  <option value="expense">Chi tiêu</option>
                  <option value="income">Thu tiền</option>
                </select>
                <ChevronDown size={16} className={styles.chev} />
              </div>
            </div>

            <div className={styles.formRow}>
              <label>Icon</label>
              <div className={styles.icons}>
                {ICON_OPTIONS.map(({ name, Icon }) => (
                  <button
                    type="button"
                    key={name}
                    className={`${styles.iconPick} ${
                      catForm.icon === name ? styles.iconPickActive : ""
                    }`}
                    onClick={() => setCatForm((s) => ({ ...s, icon: name }))}
                  >
                    <Icon size={18} />
                    {catForm.icon === name && (
                      <Check size={14} className={styles.check} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formRow}>
              <label>Màu</label>
              <input
                className={styles.color}
                type="color"
                value={catForm.color}
                onChange={(e) =>
                  setCatForm((s) => ({ ...s, color: e.target.value }))
                }
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() =>
                  setCatModal({ open: false, mode: "create", data: null })
                }
              >
                Huỷ
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={savingCat}
              >
                {savingCat ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
          </form>
        </MiniModal>

        {/* ===== Modal Label ===== */}
        <MiniModal
          open={labModal.open}
          title={labModal.mode === "create" ? "Thêm label" : "Sửa label"}
          onClose={() =>
            setLabModal({ open: false, mode: "create", data: null })
          }
        >
          <form className={styles.form} onSubmit={submitLabel}>
            <div className={styles.formRow}>
              <label>Thuộc thể loại *</label>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={labForm.categoryId}
                  onChange={(e) =>
                    setLabForm((s) => ({ ...s, categoryId: e.target.value }))
                  }
                  required
                >
                  <option value="">Chọn thể loại</option>
                  {cats
                    .filter((c) => c.id !== UNASSIGNED)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <ChevronDown size={16} className={styles.chev} />
              </div>
            </div>

            <div className={styles.formRow}>
              <label>Tên label *</label>
              <input
                className={styles.input}
                value={labForm.name}
                onChange={(e) =>
                  setLabForm((s) => ({ ...s, name: e.target.value }))
                }
                required
              />
            </div>

            <div className={styles.formRow}>
              <label>Icon</label>
              <div className={styles.icons}>
                {ICON_OPTIONS.map(({ name, Icon }) => (
                  <button
                    type="button"
                    key={`lab-${name}`}
                    className={`${styles.iconPick} ${
                      labForm.icon === name ? styles.iconPickActive : ""
                    }`}
                    onClick={() => setLabForm((s) => ({ ...s, icon: name }))}
                  >
                    <Icon size={18} />
                    {labForm.icon === name && (
                      <Check size={14} className={styles.check} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formRow}>
              <label>Màu</label>
              <input
                className={styles.color}
                type="color"
                value={labForm.color}
                onChange={(e) =>
                  setLabForm((s) => ({ ...s, color: e.target.value }))
                }
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() =>
                  setLabModal({ open: false, mode: "create", data: null })
                }
              >
                Huỷ
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={savingLab}
              >
                {savingLab ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
          </form>
        </MiniModal>
      </div>
    </div>
  );
}
