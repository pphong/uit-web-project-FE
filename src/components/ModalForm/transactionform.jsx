import { useState } from "react";
import { X, Calendar, Book, ShoppingCart, Coffee, Utensils, Users, Shield, Car, DollarSign, Gift, Trophy } from "lucide-react";
import styles from "./ModelForm.module.css";
import CategorySelect from "../CategorySelect";

const ModalForm = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("expense");
  const [formData, setFormData] = useState({
    amount: "",
    account: "Ví",
    // category: "",
    categoriesExpense: "",
    categoriesIncome: "",
    datetime: new Date().toISOString().slice(0, 16),
    description: ""
  });

  const categoriesExpense = [
    { id: "books", name: "Sách vở", icon: Book },
    { id: "shopping", name: "Đi chợ/siêu thị", icon: ShoppingCart },
    { id: "cafe", name: "Cafe", icon: Coffee },
    { id: "breakfast", name: "Ăn sáng", icon: Utensils },
    { id: "party", name: "Ăn tiệc", icon: Users },
    { id: "insurance", name: "Bảo hiểm xe", icon: Shield },
    { id: "gas", name: "Xăng xe", icon: Car }
  ];

    const categoriesIncome = [
    { id: "salary", name: "Lương", icon: DollarSign },
    { id: "bonus", name: "Thưởng", icon: Trophy },
    { id: "gift", name: "Quà tặng", icon: Gift },
    ]

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }));
  };

  // Thêm state
    const [isSubmitted, setIsSubmitted] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);// bật validate
    // Xử lý submit form ở đây
    // Ví dụ: gọi API để lưu giao dịch
    // Sau khi lưu thành công, đóng modal
    if (formData.category === ""|| formData.amount === "") {
        console.log("Category and Amount are required.");
      return; // Ngăn không cho submit nếu category trống
    }
    console.log("Form submitted:", formData);
    onClose();
  };

  const handleSaveAndAdd = () => {
    setIsSubmitted(true);
    if (formData.category === ""|| formData.amount === "") {
        console.log("Category and Amount are required.");
      return; // Ngăn không cho submit nếu category trống
    }
    console.log("Save and add more:", formData);
    setFormData({
      amount: "",
      account: "Ví",
      category: "",
      datetime: new Date().toISOString().slice(0, 16),
      description: ""
    });
    setIsSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Thêm giao dịch</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${activeTab === "expense" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("expense")}
          >
            Chi tiền
          </button>
          <button
            className={`${styles.tab} ${activeTab === "income" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("income")}
          >
            Thu tiền
          </button>
          <button
            className={`${styles.tab} ${activeTab === "transfer" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("transfer")}
          >
            Chuyển khoản
          </button>
          <button
            className={`${styles.tab} ${activeTab === "adjust" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("adjust")}
          >
            Điều chỉnh số dư
          </button>
        </div>

        {/* Nội dung form thay đổi theo tab */}
        {activeTab === "expense" && (
          <form className={styles.form} onSubmit={handleSubmit}>
            {/*form Chi tiền */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Số tiền <span className={styles.required}>*</span>
                </label>
                <div className={styles.amountContainer}>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={styles.amountInput}
                    placeholder="0"
                  />
                  <span className={styles.currency}>₫</span>
                </div>
                {/* Chỉ hiện lỗi khi đã bấm Lưu hoặc Lưu và thêm */}
                {isSubmitted && formData.amount === "" && (
                    <span className={styles.errorText}>Không được để trống.</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Hạng mục <span className={styles.required}>*</span>
                </label>

                {/* <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Chọn hạng mục</option>
                  {categoriesExpense.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select> */}

                {/* CustomCategory */}
                <CategorySelect
                    categories={categoriesExpense}
                    value={formData.categoriesExpense}
                    onChange={(e) => setFormData((prev) => ({ ...prev, categoriesExpense: e.target.value }))}
                />


                {/* Chỉ hiện lỗi khi đã bấm Lưu hoặc Lưu và thêm */}
                {isSubmitted && formData.category === "" && (
                <span className={styles.errorText}>Không được để trống.</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tài khoản <span className={styles.required}>*</span>
                </label>
                <select
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="Ví">Ví</option>
                  <option value="Ngân hàng">Ngân hàng</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Thời gian <span className={styles.required}>*</span>
                </label>
                <input
                  type="datetime-local"
                  name="datetime"
                  value={formData.datetime}
                  onChange={handleInputChange}
                  className={styles.dateInput}
                />
              </div>
            </div>

            <div className={styles.categoryGrid}>
              {categoriesExpense.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`${styles.categoryButton} ${
                      formData.categoriesExpense === category.id ? styles.selectedCategory : ""
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, categoriesExpense: category.id}))}
                  >
                    <IconComponent size={20} className={styles.categoryIcon} />
                    <span className={styles.categoryName}>{category.name}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Diễn giải</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Nhập diễn giải"
                rows={4}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.addMoreButton}
                onClick={handleSaveAndAdd}
              >
                Thêm chi tiết
              </button>
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.saveAndAddButton}
                  onClick={handleSaveAndAdd}
                >
                  Lưu và thêm
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  Lưu
                </button>
              </div>
            </div>
          </form>
        )}

        {/*Thu tiền*/}
        {activeTab === "income" && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Số tiền <span className={styles.required}>*</span>
                </label>
                <div className={styles.amountContainer}>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={styles.amountInput}
                    placeholder="0"
                  />
                  <span className={styles.currency}>₫</span>
                </div>
                {/* Chỉ hiện lỗi khi đã bấm Lưu hoặc Lưu và thêm */}
                {isSubmitted && formData.amount === "" && (
                    <span className={styles.errorText}>Không được để trống.</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Hạng mục <span className={styles.required}>*</span>
                </label>

                {/* <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">Chọn hạng mục</option>
                  {categoriesIncome.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select> */}

                {/* CustomCategory */}
                <CategorySelect
                    categories={categoriesIncome}
                    value={formData.categoriesIncome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, categoriesIncome: e.target.value }))}
                />

                {/* Chỉ hiện lỗi khi đã bấm Lưu hoặc Lưu và thêm */}
                {isSubmitted && formData.category === "" && (
                <span className={styles.errorText}>Không được để trống.</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tài khoản <span className={styles.required}>*</span>
                </label>
                <select
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="Ví">Ví</option>
                  <option value="Ngân hàng">Ngân hàng</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Thời gian <span className={styles.required}>*</span>
                </label>
                <input
                  type="datetime-local"
                  name="datetime"
                  value={formData.datetime}
                  onChange={handleInputChange}
                  className={styles.dateInput}
                />
              </div>
            </div>

            <div className={styles.categoryGrid}>
              {categoriesIncome.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`${styles.categoryButton} ${
                      formData.categoriesIncome === category.id ? styles.selectedCategory : ""
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, categoriesIncome: category.id}))}
                  >
                    <IconComponent size={20} className={styles.categoryIcon} />
                    <span className={styles.categoryName}>{category.name}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Diễn giải</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Nhập diễn giải"
                rows={4}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.addMoreButton}
                onClick={handleSaveAndAdd}
              >
                Thêm chi tiết
              </button>
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.saveAndAddButton}
                  onClick={handleSaveAndAdd}
                >
                  Lưu và thêm
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  Lưu
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === "transfer" && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Số tiền <span className={styles.required}>*</span>
                </label>
                <div className={styles.amountContainer}>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={styles.amountInput}
                    placeholder="0"
                  />
                  <span className={styles.currency}>₫</span>
                </div>
                {/* Chỉ hiện lỗi khi đã bấm Lưu hoặc Lưu và thêm */}
                {isSubmitted && formData.amount === "" && (
                    <span className={styles.errorText}>Không được để trống.</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Từ tài khoản <span className={styles.required}>*</span>
                </label>
                <select
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="Ví">Ví</option>
                  <option value="Ngân hàng">Ngân hàng</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Đến tài khoản <span className={styles.required}>*</span>
                </label>
                <select
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="Ví">Ví</option>
                  <option value="Ngân hàng">Ngân hàng</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Thời gian <span className={styles.required}>*</span>
                </label>
                <input
                  type="datetime-local"
                  name="datetime"
                  value={formData.datetime}
                  onChange={handleInputChange}
                  className={styles.dateInput}
                />
              </div>
            </div>

            {/* <div className={styles.categoryGrid}>
              {categoriesIncome.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`${styles.categoryButton} ${
                      formData.category === category.id ? styles.selectedCategory : ""
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <IconComponent size={20} className={styles.categoryIcon} />
                    <span className={styles.categoryName}>{category.name}</span>
                  </button>
                );
              })}
            </div> */}

            <div className={styles.formGroup}>
              <label className={styles.label}>Diễn giải</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Nhập diễn giải"
                rows={4}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.addMoreButton}
                onClick={handleSaveAndAdd}
              >
                Thêm chi tiết
              </button>
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.saveAndAddButton}
                  onClick={handleSaveAndAdd}
                >
                  Lưu và thêm
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  Lưu
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === "adjust" && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Số tiền <span className={styles.required}>*</span>
                </label>
                <div className={styles.amountContainer}>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={styles.amountInput}
                    placeholder="0"
                  />
                  <span className={styles.currency}>₫</span>
                </div>
                {/* Chỉ hiện lỗi khi đã bấm Lưu hoặc Lưu và thêm */}
                {isSubmitted && formData.amount === "" && (
                    <span className={styles.errorText}>Không được để trống.</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Hạng mục <span className={styles.required}>*</span>
                </label>

                {/* CustomCategory */}
                <CategorySelect
                    categories={categoriesIncome}
                    value={formData.category}
                    onChange={handleInputChange}
                />

                {/* Chỉ hiện lỗi khi đã bấm Lưu hoặc Lưu và thêm */}
                {isSubmitted && formData.category === "" && (
                <span className={styles.errorText}>Không được để trống.</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tài khoản <span className={styles.required}>*</span>
                </label>
                <select
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="Ví">Ví</option>
                  <option value="Ngân hàng">Ngân hàng</option>
                  <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Thời gian <span className={styles.required}>*</span>
                </label>
                <input
                  type="datetime-local"
                  name="datetime"
                  value={formData.datetime}
                  onChange={handleInputChange}
                  className={styles.dateInput}
                />
              </div>
            </div>

            <div className={styles.categoryGrid}>
              {categoriesIncome.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`${styles.categoryButton} ${
                      formData.category === category.id ? styles.selectedCategory : ""
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <IconComponent size={20} className={styles.categoryIcon} />
                    <span className={styles.categoryName}>{category.name}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Diễn giải</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Nhập diễn giải"
                rows={4}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.addMoreButton}
                onClick={handleSaveAndAdd}
              >
                Thêm chi tiết
              </button>
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.saveAndAddButton}
                  onClick={handleSaveAndAdd}
                >
                  Lưu và thêm
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  Lưu
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalForm;
