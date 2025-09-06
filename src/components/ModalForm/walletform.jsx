import { useState } from "react";
import { X, Wallet, DollarSign, FileText, CreditCard, Banknote, PiggyBank } from "lucide-react";
import styles from "./ModelForm.module.css";

const WalletForm = ({ isOpen, onClose, onSubmit }) => {
  // State để quản lý dữ liệu form - khớp với API schema
  const [formData, setFormData] = useState({
    name: "",              // Tên ví/tài khoản (required)
    currency: "VND",       // Đơn vị tiền tệ (default VND)
    description: "",       // Mô tả về ví
    initialBalance: 0,     // Số dư ban đầu
    isDefault: false       // Có phải ví mặc định không
  });

  // State để quản lý validation khi submit
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State để quản lý loading khi gọi API
  const [isLoading, setIsLoading] = useState(false);

  // Danh sách các loại ví với icon
//   const walletTypes = [
//     { id: "cash", name: "Tiền mặt", icon: Banknote },
//     { id: "bank", name: "Ngân hàng", icon: CreditCard },
//     { id: "credit", name: "Thẻ tín dụng", icon: CreditCard },
//     { id: "savings", name: "Tiết kiệm", icon: PiggyBank },
//     { id: "investment", name: "Đầu tư", icon: DollarSign },
//     { id: "other", name: "Khác", icon: Wallet }
//   ];

  // Danh sách các đơn vị tiền tệ
  const currencies = [
    { code: "VND", name: "Việt Nam Đồng", symbol: "₫" },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" }
  ];

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Xử lý chọn loại ví (optional - có thể thêm vào schema sau)
//   const handleWalletTypeSelect = (typeId) => {
//     setFormData(prev => ({
//       ...prev,
//       walletType: typeId 
//     }));
//   };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Kiểm tra tên ví (required)
    if (!formData.name.trim()) {
      errors.name = "Tên ví không được để trống";
    }
    
    // Kiểm tra currency (required)
    if (!formData.currency) {
      errors.currency = "Vui lòng chọn đơn vị tiền tệ";
    }
    
    // Kiểm tra số dư ban đầu (phải là số không âm)
    if (formData.initialBalance < 0) {
      errors.initialBalance = "Số dư ban đầu không được âm";
    }
    
    return errors;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Chuẩn bị dữ liệu gửi lên backend
      const walletData = {
        name: formData.name.trim(),
        currency: formData.currency,
        description: formData.description.trim(),
        initialBalance: parseFloat(formData.initialBalance) || 0,
        isDefault: formData.isDefault
      };
      
      console.log("Sending wallet data to backend:", walletData);
      
      // Gọi API thông qua props onSubmit
      if (onSubmit) {
        await onSubmit(walletData);
      }
      
      // Reset form sau khi tạo thành công
      resetForm();
      onClose();
      
    } catch (error) {
      console.error("Error creating wallet:", error);
      // Có thể thêm toast notification ở đây
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form về trạng thái ban đầu
  const resetForm = () => {
    setFormData({
      name: "",
      currency: "VND",
      description: "",
      initialBalance: 0,
      isDefault: false
    });
    setIsSubmitted(false);
  };

  // Xử lý đóng modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Nếu modal không mở thì không render
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header của modal */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Tạo ví mới</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form tạo ví */}
        <form className={styles.form} onSubmit={handleSubmit}>
          
          {/* Row 1: Tên ví và Đơn vị tiền tệ */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Tên ví <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.select} // Sử dụng class select để có style nhất quán
                placeholder="Nhập tên ví"
                disabled={isLoading}
              />
              {/* Hiển thị lỗi validation */}
              {isSubmitted && !formData.name.trim() && (
                <span className={styles.errorText}>Tên ví không được để trống.</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Đơn vị tiền tệ <span className={styles.required}>*</span>
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className={styles.select}
                disabled={isLoading}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
              {/* Hiển thị lỗi validation */}
              {isSubmitted && !formData.currency && (
                <span className={styles.errorText}>Vui lòng chọn đơn vị tiền tệ.</span>
              )}
            </div>
          </div>

          {/* Row 2: Số dư ban đầu và Checkbox ví mặc định */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Số dư ban đầu</label>
              <div className={styles.amountContainer}>
                <input
                  type="number"
                  name="initialBalance"
                  value={formData.initialBalance}
                  onChange={handleInputChange}
                  className={styles.amountInput}
                  placeholder="0"
                  min="0"
                  step="1000"
                  disabled={isLoading}
                />
                <span className={styles.currency}>
                  {currencies.find(c => c.code === formData.currency)?.symbol || "₫"}
                </span>
              </div>
              {/* Hiển thị lỗi validation */}
              {isSubmitted && formData.initialBalance < 0 && (
                <span className={styles.errorText}>Số dư ban đầu không được âm.</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Cài đặt</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="isDefault" style={{ margin: 0, fontSize: '14px', cursor: 'pointer' }}>
                  Đặt làm ví mặc định
                </label>
              </div>
            </div>
          </div>

          {/* Grid hiển thị các loại ví (tương tự category grid) */}
          {/* <div className={styles.categoryGrid}>
            {walletTypes.map((walletType) => {
              const IconComponent = walletType.icon;
              return (
                <button
                  key={walletType.id}
                  type="button"
                  className={`${styles.categoryButton} ${
                    formData.walletType === walletType.id ? styles.selectedCategory : ""
                  }`}
                  onClick={() => handleWalletTypeSelect(walletType.id)}
                  disabled={isLoading}
                >
                  <IconComponent size={20} className={styles.categoryIcon} />
                  <span className={styles.categoryName}>{walletType.name}</span>
                </button>
              );
            })}
          </div> */}

          {/* Mô tả ví */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Nhập mô tả về ví (tùy chọn)"
              rows={4}
              disabled={isLoading}
            />
          </div>

          {/* Các nút hành động */}
          <div className={styles.formActions}>
            <div></div> {/* Empty div để căn chỉnh */}
            
            <div className={styles.actionButtons}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </button>
              
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isLoading}
              >
                {isLoading ? "Đang tạo..." : "Tạo ví"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletForm;

/* 
HƯỚNG DẪN SỬ DỤNG VÀ TÍCH HỢP BACKEND:

1. IMPORT VÀ SỬ DỤNG COMPONENT:
```jsx
import WalletForm from './WalletForm';

const App = () => {
  const [isWalletFormOpen, setIsWalletFormOpen] = useState(false);

  const handleCreateWallet = async (walletData) => {
    // Gọi API tạo ví
    const response = await fetch('/api/wallets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // nếu cần
      },
      body: JSON.stringify(walletData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create wallet');
    }
    
    return response.json();
  };

  return (
    <div>
      <button onClick={() => setIsWalletFormOpen(true)}>
        Tạo ví mới
      </button>
      
      <WalletForm 
        isOpen={isWalletFormOpen}
        onClose={() => setIsWalletFormOpen(false)}
        onSubmit={handleCreateWallet}
      />
    </div>
  );
};
```

2. DỮ LIỆU GỬI LÊN BACKEND:
Component sẽ gửi object với cấu trúc:
```json
{
  "name": "Ví tiền mặt",
  "currency": "VND", 
  "description": "Ví để chứa tiền mặt hàng ngày",
  "initialBalance": 1000000,
  "isDefault": true
}
```

3. XỬ LÝ LỖI TỪ BACKEND:
Trong hàm handleCreateWallet, bạn có thể xử lý các lỗi:
```jsx
const handleCreateWallet = async (walletData) => {
  try {
    const response = await fetch('/api/wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(walletData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create wallet');
    }
    
    // Thành công - có thể thêm toast notification
    toast.success('Tạo ví thành công!');
    
    return response.json();
  } catch (error) {
    // Xử lý lỗi - có thể thêm toast notification
    toast.error(error.message || 'Có lỗi xảy ra khi tạo ví');
    throw error;
  }
};
```

4. VALIDATION:
Component đã có validation phía frontend:
- name: không được trống
- currency: bắt buộc chọn
- initialBalance: không được âm

Backend cũng nên validate những điều kiện tương tự.
*/