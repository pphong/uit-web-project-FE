import React from "react";
import styles from "./ComingSoon.module.css";
import { Wrench, Hammer, Sparkles, Rocket, ChevronLeft } from "lucide-react";

/**
 * ComingSoon
 * Props:
 *  - feature?: string          // Tên tính năng (ví dụ: "Báo cáo", "Kết nối ngân hàng")
 *  - title?: string            // Tuỳ chỉnh tiêu đề (mặc định: "Tính năng đang phát triển")
 *  - subtitle?: string         // Tuỳ chỉnh mô tả
 *  - onBack?: () => void       // Callback khi bấm "Quay lại"
 *  - className?: string
 */
export default function ComingSoon({
  feature = "Tính năng đang phát triển",
  title = "",
  subtitle = "Chúng mình đang hoàn thiện để mang lại trải nghiệm tốt nhất. Cảm ơn bạn đã chờ nhé!",
  onBack,
  className = "",
}) {
  return (
    <section className={`${styles.wrap} ${className}`} aria-live="polite">
      {/* background blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        <div className={styles.badge}>
          <Sparkles size={16} />
          <span>Sắp có!</span>
        </div>

        <div className={styles.illust}>
          <div className={styles.iconStack}>
            <span className={`${styles.float} ${styles.delay0}`}>
              <Wrench size={40} />
            </span>
            <span className={`${styles.float} ${styles.delay1}`}>
              <Hammer size={40} />
            </span>
            <span className={`${styles.float} ${styles.delay2}`}>
              <Rocket size={40} />
            </span>
          </div>
          <div className={styles.progress}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>

        <h2 className={styles.title}>
          {title}{" "}
          {feature && <span className={styles.feature}>• {feature}</span>}
        </h2>
        <p className={styles.desc}>{subtitle}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={onBack}
            title="Quay lại"
          >
            <ChevronLeft size={18} />
            Quay lại
          </button>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => alert("Cảm ơn bạn! Chức năng sẽ sớm ra mắt.")}
          >
            Nhận thông báo
          </button>
        </div>
      </div>
    </section>
  );
}
