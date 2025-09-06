import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./LoginPage.module.css";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/home";

  const { state, login } = useAuth();

  useEffect(() => {
    const hasToken = !!localStorage.getItem("accessToken");
    if (hasToken) navigate(from, { replace: true });
  }, [from]);

  const onChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email: form.email.trim(), password: form.password });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(from, { replace: true });
      }, 2000);
    } catch (err) {
      alert(err?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className={styles.container}>
      {/* Loading overlay */}
      {state.loading && (
        <div className={styles.overlay}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Đang đăng nhập...</p>
        </div>
      )}

      {/* Success modal */}
      {showSuccess && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.okIcon}>✓</div>
            <h3>Đăng nhập thành công</h3>
            <p style={{ padding: "12px" }}>Chuyển hướng trong giây lát…</p>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <h2 className={`${styles.title} ${styles.titleGold}`}>Đăng nhập</h2>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label}>Email *</label>
          <input
            value={form.email}
            className={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            required
            autoComplete="off"
            onChange={onChange}
            disabled={state.loading || showSuccess}
          />

          <div className={styles.passwordRow}>
            <label className={styles.label}>Mật khẩu *</label>
            <a className={styles.forgotLink} href="#">
              Quên mật khẩu?
            </a>
          </div>

          <input
            value={form.password}
            className={styles.input}
            type="password"
            name="password"
            placeholder="Mật khẩu"
            required
            onChange={onChange}
            disabled={state.loading || showSuccess}
          />

          <button
            className={styles.btnLogin}
            type="submit"
            disabled={state.loading || showSuccess}
          >
            {state.loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className={styles.signupText}>
          Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>

        <div className={styles.divider}>
          <span>hoặc</span>
        </div>

        <button
          className={`${styles.btnSocial} ${styles.google}`}
          disabled={state.loading || showSuccess}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          Đăng nhập với Google
        </button>

        <button
          className={`${styles.btnSocial} ${styles.facebook}`}
          disabled={state.loading || showSuccess}
        >
          <img
            src="https://www.svgrepo.com/show/452196/facebook-1.svg"
            alt="Facebook"
          />
          Đăng nhập với Facebook
        </button>
      </div>
    </div>
  );
}
