import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogOut } from "lucide-react";
import styles from "./Header.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "TN";

/* Avatar có fallback initials khi ảnh lỗi/không có */
function AvatarCircle({ src, initials, size = 40 }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return size >= 60 ? (
      <div className={styles.accAvatarLg}>{initials}</div>
    ) : (
      <div className={styles.avatar}>{initials}</div>
    );
  }
  return size >= 60 ? (
    <img
      className={styles.accAvatarImgLg}
      src={src}
      alt="avatar"
      onError={() => setErr(true)}
    />
  ) : (
    <img
      className={styles.avatarImg}
      src={src}
      alt="avatar"
      onError={() => setErr(true)}
    />
  );
}

export default function Header({ appName = "CHI TIÊU THÔNG MINH" }) {
  const { state: auth, logout } = useAuth();
  const navigate = useNavigate();

  const profile = auth?.profile || auth?.user?.profile || auth?.user || {};
  const displayName = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    }
    return auth?.user?.name || auth?.user?.email?.split("@")[0] || "Guest";
  }, [auth, profile]);

  const email = profile?.email || auth?.user?.email || "";
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const avatarUrl = auth?.user?.profilePicture || profile?.profilePicture || "";

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  const handleLogout = async () => {
    logout();
    navigate("/login", { replace: true });
    setOpen(false);
  };

  return (
    <header className={styles.header}>
      {/* Left */}
      <div className={styles.left}>
        <div className={styles.logoBox} aria-hidden>
          <span className={styles.logoM}>M</span>
        </div>
        <span className={styles.brand}>{appName}</span>
      </div>

      {/* Center */}
      <div className={styles.center2}>
        <span className={styles.greet}>
          Xin chào <strong>{displayName}</strong>{" "}
          <span className={styles.wave} role="img" aria-label="wave">
            👋
          </span>
        </span>
      </div>

      {/* Right */}
      <div className={styles.right}>
        <button type="button" className={styles.iconBtn} aria-label="Thông báo">
          <Bell size={22} />
          <span className={styles.dot} />
        </button>

        <button
          type="button"
          className={styles.avatarBtn}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          title={displayName}
        >
          <AvatarCircle src={avatarUrl} initials={initials} size={40} />
        </button>
      </div>

      {/* Popover */}
      {open && (
        <>
          <div className={styles.menuOverlay} onClick={() => setOpen(false)} />
          <div className={styles.accountCard} role="menu">
            <div className={styles.accTop}>
              <AvatarCircle src={avatarUrl} initials={initials} size={64} />
              <div className={styles.accName}>{displayName}</div>
              <div className={styles.accEmail}>{email || "—"}</div>
            </div>

            <div className={styles.accDivider} />

            <button
              type="button"
              className={`${styles.accAction} ${styles.center1}`} /* căn giữa nút */
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </>
      )}
    </header>
  );
}
