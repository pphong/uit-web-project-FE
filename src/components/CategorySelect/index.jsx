import { useState } from "react";
import styles from "./CategorySelect.module.css";

const CategorySelect = ({ categories, value, onChange }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (catId) => {
    onChange({ target: { name: "category", value: catId } });
    setOpen(false);
  };

  return (
    <div className={styles.customSelect}>
      <div className={styles.selected} onClick={() => setOpen(!open)}>
        {value
          ? (() => {
              const selected = categories.find((c) => c.id === value);
              const Icon = selected?.icon;
              return (
                <>
                  {Icon && <Icon size={18} className={styles.optionIcon} />}
                  <span>{selected?.name}</span>
                </>
              );
            })()
          : "Chọn hạng mục"}
      </div>

      {open && (
        <div className={styles.options}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className={styles.option}
                onClick={() => handleSelect(cat.id)}
              >
                <Icon size={18} className={styles.optionIcon} />
                <span>{cat.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
