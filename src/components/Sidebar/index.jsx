import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  CreditCard,
  Edit3,
  FileClock,
  Landmark,
  BarChart3,
  MessageCircle,
  ChevronLeft,
  Settings as SettingsIcon,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { AUTH } from "../../state/auth/reducer";
import { useAuth } from "../../contexts/AuthContext";

import { Tags } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Item({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
  rightIcon,
  collapsed,
}) {
  return (
    <button
      type="button"
      className={[
        styles.item,
        active && styles.active,
        disabled && styles.disabled,
        collapsed && styles.collapsed,
      ].join(" ")}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      title={collapsed ? label : undefined}
    >
      <span className={styles.itemIcon}>
        <Icon size={20} />
      </span>
      <span className={styles.itemLabel}>{label}</span>
      {rightIcon ? (
        <span className={styles.itemRightIcon}>{rightIcon}</span>
      ) : null}
    </button>
  );
}

function SubItem({ label, active, disabled, onClick, collapsed }) {
  return (
    <button
      type="button"
      className={[
        styles.subItem,
        active && styles.activeSub,
        disabled && styles.disabled,
        collapsed && styles.collapsed,
      ].join(" ")}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      title={collapsed ? label : undefined}
    >
      <span className={styles.dot} />
      <span className={styles.subLabel}>{label}</span>
    </button>
  );
}

/* ===== Modal chỉnh sửa hồ sơ: mở ra thì GET, lưu thì PUT ===== */
/* ===== Modal chỉnh sửa hồ sơ: mở ra thì GET (trả về {message,user}), lưu thì PUT ===== */
function EditProfileModal({ open, onClose, onSave }) {
  const { state, dispatch } = useAuth();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getToken = () =>
    state?.token || state?.accessToken || localStorage.getItem("accessToken");

  const toYMD = (s) => (s ? String(s).split("T")[0] : "");
  const normalize = (u = {}) => ({
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    phoneNumber: u.phoneNumber ?? "",
    dateOfBirth: toYMD(u.dateOfBirth),
    address: u.address ?? "",
    profilePicture: u.profilePicture ?? "",
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/v1/auth/profile`, {
          headers: { Authorization: `Bearer ${getToken() || ""}` },
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

        // API của bạn trả { message, user }
        const user = json?.user || json?.data?.user || {};
        const profile = normalize(user);

        setForm(profile); // đổ vào form
        console.log("New Profile user", user);
        console.log("New Profile profile", profile);
        dispatch({ type: AUTH.SET_PROFILE, payload: { profile } });
      } catch (e) {
        console.error("GET /auth/profile failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const handle = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const canSave = form?.firstName.trim() && form?.lastName.trim();

  // Lưu -> PUT /api/v1/auth/profile (server có thể trả { message, user })
  async function submit(e) {
    e.preventDefault();
    if (!canSave || saving) return;

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/v1/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken() || ""}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

      console.log("Check profile ở PUT", json);

      const updatedProfile = normalize(json?.user || json?.profile || form);

      dispatch({
        type: AUTH.SET_PROFILE,
        payload: { profile: updatedProfile },
      });
      onSave?.(updatedProfile);
      onClose();
    } catch (err) {
      alert(`Cập nhật thất bại: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <h3 className={styles.modalTitle}>Chỉnh sửa thông tin người dùng</h3>

        <form onSubmit={submit}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Họ *</label>
              <input
                className={styles.input}
                name="lastName"
                value={form.lastName}
                onChange={handle}
                placeholder="Nguyen"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tên *</label>
              <input
                className={styles.input}
                name="firstName"
                value={form.firstName}
                onChange={handle}
                placeholder="Trong"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Số điện thoại</label>
              <input
                className={styles.input}
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handle}
                placeholder="09xxxxxxxx"
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Ngày sinh</label>
              <input
                className={styles.input}
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth || ""}
                onChange={handle}
                max={today}
                disabled={loading}
              />
            </div>

            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.label}>Địa chỉ</label>
              <input
                className={styles.input}
                name="address"
                value={form.address}
                onChange={handle}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                disabled={loading}
              />
            </div>

            <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.label}>Ảnh đại diện (URL)</label>
              <input
                className={styles.input}
                name="profilePicture"
                value={form.profilePicture}
                onChange={handle}
                placeholder="https://…/avatar.jpg"
                disabled={loading}
              />
              {form.profilePicture ? (
                <img
                  className={styles.preview}
                  src={form.profilePicture}
                  alt="preview"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : null}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnGhost} onClick={onClose}>
              Huỷ
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={!canSave || saving || loading}
            >
              {saving ? "Đang lưu…" : loading ? "Đang tải…" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Sidebar({ activeKey = "home", onSelect = () => {} }) {
  const [openNotes, setOpenNotes] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  // animation vùng con: dùng max-height chuyển động
  const subMaxHeight = openNotes ? 150 : 0; // px; đủ chứa 3 item
  const [openModal, setOpenModal] = useState(false);

  return (
    <aside
      className={[styles.sidebar, collapsed && styles.sidebarCollapsed].join(
        " "
      )}
    >
      {/* Top action */}
      <div className={styles.topAction}>
        <button type="button" className={styles.addBtn} title="Thêm ghi chép">
          <Plus size={18} />
          <span>Quản lý danh mục</span>
        </button>
        <button
          type="button"
          className={styles.dropBtn}
          aria-label="Thêm tuỳ chọn"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <Item
          icon={Tags}
          label="Quản lý danh mục"
          active={activeKey === "categories"}
          onClick={() => onSelect("categories")}
          collapsed={collapsed}
        />

        <Item
          icon={LayoutGrid}
          label="Trang chủ"
          active={activeKey === "home"}
          onClick={() => onSelect("home")}
          collapsed={collapsed}
        />

        <Item
          icon={CreditCard}
          label="Tài khoản"
          active={activeKey === "accounts"}
          onClick={() => onSelect("accounts")}
          collapsed={collapsed}
        />

        <Item
          icon={Edit3}
          label="Ghi chép"
          rightIcon={
            openNotes ? <ChevronUp size={18} /> : <ChevronDown size={18} />
          }
          onClick={() => setOpenNotes((v) => !v)}
          active={activeKey === "notes"}
          collapsed={collapsed}
        />

        <div
          className={styles.subGroup}
          style={{ maxHeight: collapsed ? 0 : subMaxHeight }}
          aria-hidden={!openNotes}
        >
          <SubItem
            label="Ghi chép thu chi"
            active={activeKey === "note-single"}
            onClick={() => onSelect("note-single")}
            collapsed={collapsed}
          />
          <SubItem
            label="Ghi chép hàng loạt"
            active={activeKey === "note-batch"}
            onClick={() => onSelect("note-batch")}
            collapsed={collapsed}
          />
          <SubItem
            label="Nhập bằng excel"
            onClick={() => onSelect("note-excel")}
            collapsed={collapsed}
            active={activeKey === "note-excel"}
          />
        </div>

        <Item
          icon={FileClock}
          label="Lịch sử ghi chép"
          active={activeKey === "history"}
          onClick={() => onSelect("history")}
          collapsed={collapsed}
        />

        <Item
          icon={Landmark}
          label="Kết nối ngân hàng"
          disabled
          onClick={() => {}}
          collapsed={collapsed}
        />

        <Item
          icon={BarChart3}
          label="Báo cáo"
          disabled
          onClick={() => {}}
          collapsed={collapsed}
        />

        <div className={styles.spacer} />

        <Item
          icon={MessageCircle}
          label="Hỗ trợ khách hàng"
          active={activeKey === "support"}
          onClick={() => onSelect("support")}
          collapsed={collapsed}
        />

        <div className={styles.bottom}>
          <Item
            icon={ChevronLeft}
            label="Thu gọn"
            onClick={() => setCollapsed((v) => !v)}
            collapsed={collapsed}
          />
          <Item
            icon={SettingsIcon}
            label="Cài đặt"
            onClick={() => setOpenModal(true)}
            collapsed={collapsed}
          />
        </div>
      </nav>

      <EditProfileModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={(profile) => {
          console.log("Profile đã cập nhật:", profile);
        }}
      />
    </aside>
  );
}
