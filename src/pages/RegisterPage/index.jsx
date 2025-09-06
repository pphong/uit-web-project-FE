import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa6";
import { AiOutlineCheckCircle } from "react-icons/ai";
import styles from "./RegisterPage.module.css";

const MODAL_STAY_MS = 1000; // thời gian hiển thị modal trước khi điều hướng

const BASE_URL = "http://localhost:3000";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const fetchAPI = async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    let json;

    try {
      json = await res.json();
    } catch (error) {
      console.log("Check error", error);
    }

    if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
    if (json?.success === false)
      throw new Error(json.message || "Đăng ký thất bại");

    return json?.data && json;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.confirm) {
      return alert("Vui lòng nhập đầy đủ thông tin.");
    }
    if (form.password !== form.confirm) {
      return alert("Mật khẩu nhập lại không khớp.");
    }

    try {
      setLoading(true);
      await fetchAPI(form);
      setShowModal(true);
      setTimeout(() => navigate("/login"), MODAL_STAY_MS);
    } catch (error) {
      console.log("Throw error here...");
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const goLoginNow = () => navigate("/login");

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={`${styles.title} ${styles.titleGold}`}>Đăng ký</h1>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label} htmlFor="email">
            Email <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            className={styles.input}
            autoComplete="email"
            disabled={loading}
          />

          <label className={styles.label} htmlFor="password">
            Mật khẩu <span className={styles.required}>*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={onChange}
            className={styles.input}
            autoComplete="new-password"
            disabled={loading}
          />

          <label className={styles.label} htmlFor="confirm">
            Nhập lại mật khẩu <span className={styles.required}>*</span>
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={form.confirm}
            onChange={onChange}
            className={styles.input}
            autoComplete="new-password"
            disabled={loading}
          />

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className={styles.swapText}>
          Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>

        <div className={styles.divider}>
          <span>hoặc</span>
        </div>

        <button type="button" className={styles.socialBtn}>
          <span className={styles.iconWrap} aria-hidden>
            <FcGoogle />
          </span>
          Đăng ký với Google
        </button>

        <button type="button" className={`${styles.socialBtn} ${styles.fbBtn}`}>
          <span className={styles.iconWrap} aria-hidden>
            <FaFacebookF />
          </span>
          Đăng ký với Facebook
        </button>
      </div>

      {/* Overlay loading */}
      {loading && (
        <div className={styles.overlay}>
          <div className={styles.loader}></div>
        </div>
      )}

      {/* Modal thành công + animation */}
      {showModal && (
        <div className={`${styles.modal} ${styles.fadeIn}`}>
          <div className={`${styles.modalCard} ${styles.popIn}`}>
            <AiOutlineCheckCircle className={styles.checkIcon} />
            <div className={styles.modalTitle}>Đăng ký thành công</div>
            <div className={styles.modalText}>
              Đang chuyển về trang đăng nhập...
            </div>
            <button className={styles.modalBtn} onClick={goLoginNow}>
              Về đăng nhập
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
