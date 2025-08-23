import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log(data);
    const email = data.get("email");
    const password = data.get("password");
    const confirm = data.get("confirm");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    console.log({
      email,
      password,
    });

    // TODO: call API register ở đây
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Đăng ký</h2>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="off"
          />

          {/* Password */}
          <label className={styles.label} htmlFor="password">
            Mật khẩu
          </label>
          <input
            className={styles.input}
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          {/* Confirm password */}
          <label className={styles.label} htmlFor="confirm">
            Nhập lại mật khẩu
          </label>
          <input
            className={styles.input}
            id="confirm"
            name="confirm"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          {/* Error message */}
          {error && <div className={styles.error}>{error}</div>}

          {/* Submit */}
          <button className={styles.btnPrimary} type="submit">
            Đăng ký
          </button>
        </form>

        {/* Switch to login */}
        <p className={styles.switchText}>
          Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>

        {/* Divider */}
        <div className={styles.divider}>
          <span>or</span>
        </div>

        {/* Social */}
        <button className={`${styles.btnSocial} ${styles.google}`}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          Sign up with Google
        </button>

        <button className={`${styles.btnSocial} ${styles.facebook}`}>
          <img
            src="https://www.svgrepo.com/show/452196/facebook-1.svg"
            alt="Facebook"
          />
          Sign up with Facebook
        </button>
      </div>
    </div>
  );
}
