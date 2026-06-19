import { useState } from "react";
import "./AddDoctorForm.css";

export default function AddDoctorForm() {
  const [formData, setFormData] = useState({
    password: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    address: "",
    profilePicture: "",
    licenseNumber: "",
    specializations: "",
    experience: "",
    department: "",
    hospitalId: "",
    consultationFee: "",
    isActive: true
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    try {
      const payload = {
        ...formData,
        // تحويل التخصصات من نص إلى مصفوفة
        specializations: formData.specializations
          .split(",")
          .map(s => s.trim())
          .filter(Boolean),
        // تحويل الأرقام
        experience: formData.experience ? Number(formData.experience) : 0,
        consultationFee: formData.consultationFee ? Number(formData.consultationFee) : 0
      };

      // ✅ التصحيح هنا: تغيير الرابط ليتوافق مع server.js (رابط مباشر ونظيف)
      const response = await fetch("http://localhost:5000/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Failed");

      setStatus({ loading: false, success: true, error: "" });

      // إعادة تعيين النموذج
      setFormData({
        password: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        phoneNumber: "",
        email: "",
        address: "",
        profilePicture: "",
        licenseNumber: "",
        specializations: "",
        experience: "",
        department: "",
        hospitalId: "",
        consultationFee: "",
        isActive: true
      });

      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);

    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div className="add-doctor-container">
      {status.success && (
        <div className="success-toast">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <h4>تمت الإضافة بنجاح</h4>
            <p>تم تسجيل الطبيب</p>
          </div>
        </div>
      )}

      {status.error && (
        <div className="error-toast">
          <strong>خطأ:</strong> {status.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="doctor-form">
        <h2>➕ إضافة طبيب</h2>

        {/* 👤 المعلومات الشخصية */}
        <fieldset>
          <legend>👤 المعلومات الشخصية</legend>
          <div className="form-grid">
            <Input label="الرقم السري" type="password" name="password" value={formData.password} onChange={handleChange} />
            <Input label="الاسم" name="firstName" value={formData.firstName} onChange={handleChange} />
            <Input label="اللقب" name="lastName" value={formData.lastName} onChange={handleChange} />
            <Input type="date" label="تاريخ الميلاد" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
            
            {/* ✅ Select مصحح وكامل */}
            <Select 
              label="الجنس" 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              options={["", "male", "female", "other"]}
              labels={["اختر الجنس", "ذكر", "أنثى", "آخر"]}
            />
            
            <Input label="الهاتف" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
            <Input label="الإيميل" name="email" value={formData.email} onChange={handleChange} />
            <Input label="العنوان" name="address" value={formData.address} onChange={handleChange} />
          </div>
        </fieldset>

        {/* 🏥 معلومات العمل */}
        <fieldset>
          <legend>🏥 معلومات العمل</legend>
          <div className="form-grid">
            <Input label="رقم الرخصة" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
            <Input
              label="التخصصات (افصل بفاصلة)"
              name="specializations"
              value={formData.specializations}
              onChange={handleChange}
              placeholder="Cardiology, Surgery"
            />
            <Input type="number" label="سنوات الخبرة" name="experience" value={formData.experience} onChange={handleChange} />
            <Input label="القسم" name="department" value={formData.department} onChange={handleChange} />
            <Input label="Hospital ID" name="hospitalId" value={formData.hospitalId} onChange={handleChange} />
            <Input type="number" label="سعر الاستشارة" name="consultationFee" value={formData.consultationFee} onChange={handleChange} />
          </div>
        </fieldset>

        <button className="submit-btn" disabled={status.loading}>
          {status.loading ? "جاري الحفظ..." : "💾 حفظ الطبيب"}
        </button>
      </form>
    </div>
  );
}

/* 🔹 مكون Input */
function Input({ label, name, type = "text", value, onChange, placeholder }) {
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

/* 🔹 مكون Select - ✅ المصحح والكامل */
function Select({ label, name, value, onChange, options, labels }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <select name={name} value={value} onChange={onChange}>
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {labels ? labels[i] : opt}
          </option>
        ))}
      </select>
    </div>
  );
}