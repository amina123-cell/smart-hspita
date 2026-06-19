import { useState } from 'react';
import './AddNurseForm.css';

export default function AddNurseForm() {
  // ✅ التصحيح 1: تأكد أن كل الحقول المستخدمة في الفورم موجودة هنا
  const [formData, setFormData] = useState({
    password: '',
    firstName: '',
    familyName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '', // ✅ أضفنا هذا الحقل ليتطابق مع الـ Input في الأسفل
    address: '',
    licenseNumber: '',
    department: '',
    shiftPreference: '',
    skills: '',
    supervisor: '',
    assignedPatients: ''
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      // ✅ تجهيز البيانات للإرسال (تحويل النصوص لمصفوفات)
      const payload = {
        ...formData,
        // حذف الحقول الفارغة أو غير الضرورية إذا أردت
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        assignedPatients: formData.assignedPatients ? formData.assignedPatients.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      const res = await fetch('http://localhost:5000/nurses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "حدث خطأ أثناء الإضافة");

      setStatus({ loading: false, success: true, error: '' });

      // ✅ إعادة تعيين النموذج
      setFormData({
        password: '',
        firstName: '',
        familyName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        email: '',
        address: '',
        licenseNumber: '',
        department: '',
        shiftPreference: '',
        skills: '',
        supervisor: '',
        assignedPatients: ''
      });

      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 4000);

    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div className="add-nurse-container">
      
      {status.success && (
        <div className="success-toast">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <h4>تمت الإضافة بنجاح</h4>
            <p>تم تسجيل الممرض/ة في النظام</p>
          </div>
        </div>
      )}

      {status.error && (
        <div className="error-toast">
          <strong>خطأ:</strong> {status.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="nurse-form">
        <h2>➕ إضافة ممرض/ة جديد/ة</h2>

        <fieldset>
          <legend>👤 المعلومات الشخصية</legend>
          <div className="form-grid">
            <Input label="الرقم السري" type="password" name="password" value={formData.password} onChange={handleChange} required />
            <Input label="الاسم الأول" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <Input label="اسم العائلة" name="familyName" value={formData.familyName} onChange={handleChange} required />
            <Input type="date" label="تاريخ الميلاد" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
            
            <Select 
              label="الجنس" 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              options={["", "male", "female", "other"]}
              labels={["اختر...", "ذكر", "أنثى", "آخر"]}
            />
            
            <Input type="tel" label="رقم الهاتف" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="05XXXXXXXX" required />
            {/* ✅ الآن هذا الحقل سيعمل بدون أخطاء لأن email موجود في state */}
            <Input type="email" label="البريد الإلكتروني" name="email" value={formData.email} onChange={handleChange} />
            <Input label="العنوان" name="address" value={formData.address} onChange={handleChange} />
          </div>
        </fieldset>

        <fieldset>
          <legend>🏥 معلومات العمل</legend>
          <div className="form-grid">
            <Input label="رقم الرخصة" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
            <Input label="القسم" name="department" value={formData.department} onChange={handleChange} placeholder="مثال: الطوارئ" />
            <Select
              label="نوبة العمل"
              name="shiftPreference"
              value={formData.shiftPreference}
              onChange={handleChange}
              options={["", "morning", "evening", "night", "flexible"]}
              labels={["اختر...", "صباحية", "مسائية", "ليلية", "مرنة"]}
            />
            <Input 
              label="المهارات (افصل بفاصلة)" 
              name="skills" 
              value={formData.skills} 
              onChange={handleChange} 
              placeholder="IV, CPR, Pediatrics"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>👨‍⚕️ الإشراف والتكليف</legend>
          <div className="form-grid">
            <Input label="المشرف (Doctor ID)" name="supervisor" value={formData.supervisor} onChange={handleChange} placeholder="أدخل معرف الطبيب" />
            <Input 
              label="المرضى المكلف بهم (افصل بفاصلة)" 
              name="assignedPatients" 
              value={formData.assignedPatients} 
              onChange={handleChange} 
              placeholder="patientId1, patientId2"
            />
          </div>
        </fieldset>

        <button className="submit-btn" disabled={status.loading}>
          {status.loading ? "⏳ جاري الحفظ..." : "💾 حفظ الممرض/ة"}
        </button>
      </form>
    </div>
  );
}

function Input({ label, type = "text", name, value, onChange, placeholder, required }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={value} // ✅ الآن القيمة دائماً محددة (Controlled)
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

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