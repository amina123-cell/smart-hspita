import { useState } from "react";
import "./AddAdminForm.css";

export default function AddAdminForm() {
  const [formData, setFormData] = useState({
    password: "",
    firstName: "",
    familyName: "",
    phoneNumber: "",
    address: "",
    profilePicture: "",
    department: "",
    role: "",
    permissions: "",
    isActive: true,
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({
      loading: true,
      success: false,
      error: "",
    });

    try {
      const payload = {
        ...formData,
        permissions: formData.permissions
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
      };

      console.log("Sending Data:", payload);

      // ✅ التصحيح هنا: تغيير الرابط ليتوافق مع server.js (رابط مباشر ونظيف)
      const response = await fetch(
        "http://localhost:5000/admins",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      console.log("Status:", response.status);
      console.log("Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to add admin");
      }

      setStatus({
        loading: false,
        success: true,
        error: "",
      });

      setFormData({
        password: "",
        firstName: "",
        familyName: "",
        phoneNumber: "",
        address: "",
        profilePicture: "",
        department: "",
        role: "",
        permissions: "",
        isActive: true,
      });

      setTimeout(() => {
        setStatus((prev) => ({
          ...prev,
          success: false,
        }));
      }, 5000);
    } catch (err) {
      console.error(err);

      setStatus({
        loading: false,
        success: false,
        error: err.message,
      });
    }
  };

  return (
    <div className="add-admin-container">
      {status.success && (
        <div className="success-toast">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <h4>تمت الإضافة بنجاح</h4>
            <p>تم تسجيل الأدمن في النظام</p>
          </div>
        </div>
      )}

      {status.error && (
        <div className="error-toast">
          <strong>خطأ:</strong> {status.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <h2>👑 إضافة Admin جديد</h2>

        <fieldset>
          <legend>👤 المعلومات الشخصية</legend>

          <div className="form-grid">
            <Input
              label="الرقم السري"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <Input
              label="الاسم الأول"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />

            <Input
              label="اسم العائلة"
              name="familyName"
              value={formData.familyName}
              onChange={handleChange}
            />

            <Input
              label="رقم الهاتف"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />

            <Input
              label="العنوان"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />

            <Input
              label="رابط الصورة"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>🏢 معلومات الوظيفة</legend>
          <div className="form-grid">
            <Input
              label="القسم"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />

            <Input
              label="الدور"
              name="role"
              value={formData.role}
              onChange={handleChange}
            />

            <Input
              label="الصلاحيات"
              name="permissions"
              value={formData.permissions}
              onChange={handleChange}
              placeholder="create, update, delete"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>⚙️ إعدادات</legend>

          <Checkbox
            label="الحساب مفعل"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
        </fieldset>

        <button className="submit-btn" disabled={status.loading}>
          {status.loading ? "جاري الحفظ..." : "💾 حفظ الأدمن"}
        </button>
      </form>
    </div>
  );
}

function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="form-field">
      <label>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function Checkbox({ label, name, checked, onChange }) {
  return (
    <div className="form-field checkbox-field">
      <label>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
        />
        {label}
      </label>
    </div>
  );
}