import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });

    navigate("/home");
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
              Forgot your password?
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
          <span>or</span>
        </div>

        <button className={`${styles.btnSocial} ${styles.google}`}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          Sign in with Google
        </button>

        <button className={`${styles.btnSocial} ${styles.facebook}`}>
          <img
            src="https://www.svgrepo.com/show/452196/facebook-1.svg"
            alt="Facebook"
          />
          Sign in with Facebook
        </button>
      </div>
    </div>
  );
}
