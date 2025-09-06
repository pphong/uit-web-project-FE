import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/home";

  // Nếu đã đăng nhập rồi thì không cho vào /login nữa
  useEffect(() => {
    if (localStorage.getItem("auth")) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    // Demo logic: thay bằng call API thực tế
    // if (res.ok) { localStorage.setItem('auth', token) ... }
    const ok = email && password; // chỉ để demo
    if (!ok) return;

    localStorage.setItem("auth", "1"); // flag demo
    navigate(from, { replace: true });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Đăng nhập</h2>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label}>Email *</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            required
            autoComplete="off"
          />

          <div className={styles.passwordRow}>
            <label className={styles.label}>Mật khẩu *</label>
            <a className={styles.forgotLink} href="#">
              Quên mật khẩu?
            </a>
          </div>
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Mật khẩu"
            required
          />

          <button className={styles.btnLogin} type="submit">
            Đăng nhập
          </button>
        </form>

        <p className={styles.signupText}>
          Bạn chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>

        <div className={styles.divider}>
          <span>hoặc</span>
        </div>

        <button className={`${styles.btnSocial} ${styles.google}`}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          Đăng nhập với Google
        </button>

        <button className={`${styles.btnSocial} ${styles.facebook}`}>
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
