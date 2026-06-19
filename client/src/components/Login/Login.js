import { useState } from "react";
import { toast } from "react-toastify"; // ✅ تأكد من تثبيت المكتبة: npm install react-toastify
import "./Login.css";

export default function Login({ onLogin }) {
  const [role, setRole] = useState("admin");
  const [formData, setFormData] = useState({ phoneNumber: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ نفس الـ config الذكي ديالك (محافظة عليه)
  const roleConfig = {
    admin:   { label: "أدمن النظام", endpoint: "http://localhost:5000/auth/admin",   icon: "⚙️", color: "#6366f1", idKey: "adminId" },
    doctor:  { label: "طبيب",        endpoint: "http://localhost:5000/auth/doctor",  icon: "👨‍⚕️", color: "#3b82f6", idKey: "doctorId" },
    nurse:   { label: "ممرض",        endpoint: "http://localhost:5000/auth/nurse",   icon: "👩‍⚕️", color: "#06b6d4", idKey: "nurseId" },
    patient: { label: "مريض",        endpoint: "http://localhost:5000/auth/patient", icon: "👤",  color: "#10b981", idKey: "patientId" }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ تحقق بسيط قبل الإرسال
    if (formData.phoneNumber.length < 5 || formData.password.length < 3) {
      toast.warning("يرجى التأكد من صحة رقم الهاتف وكلمة المرور");
      return;
    }

    setLoading(true);
    try {
      const { endpoint, idKey } = roleConfig[role];
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "فشل تسجيل الدخول");

      const userId = result[idKey] || result._id || result.id;
      if (!userId) throw new Error("تم الدخول لكن لم يتم تحديد الهوية");

      // ✅ إشعار نجاح + تمرير البيانات لـ App.jsx
      toast.success(`🎉 مرحباً بك، ${result.name || roleConfig[role].label}`);
      
      setTimeout(() => {
        onLogin?.(role, userId, { name: result.name, token: result.token, role });
        setFormData({ phoneNumber: "", password: "" });
      }, 800);

    } catch (err) {
      const errorMsg = err.message.includes("Failed to fetch") 
        ? "🔌 لا يمكن الاتصال بالسيرفر. تأكد أنه يعمل على البورت 5000" 
        : `❌ ${err.message}`;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const current = roleConfig[role];

  return (
    <div className="login-wrapper">
      
      {/* 📸 القسم الأيسر: صورة جمالية (يظهر فقط في الشاشات الكبيرة) */}
      <div className="login-hero">
        <div className="hero-overlay">
          <div className="hero-icon">{current.icon}</div>
          <h2>MediCare Pro</h2>
          <p>منصة طبية متكاملة لإدارة العيادات، المستشفيات، والمرضى</p>
          <div className="hero-badges">
            <span>🔐 آمن</span>
            <span>⚡ سريع</span>
            <span>🌐 سحابي</span>
          </div>
        </div>
      </div>

      {/* 📝 القسم الأيمن: فورم تسجيل الدخول */}
      <div className="login-form-section">
        <div className="login-card">
          
          {/* اللوغو */}
          <h1 className="app-logo">MediCare Pro</h1>
          
          {/* صورة البروفايل المتغيرة حسب الدور */}
          <div className="role-avatar" style={{ "--accent": current.color }}>
            <span className="avatar-icon">{current.icon}</span>
            <span className="avatar-label">{current.label}</span>
          </div>

          <form onSubmit={handleSubmit} className="form">
            
            {/* حقل الهاتف */}
            <div className="input-group">
              <label>رقم الهاتف</label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                placeholder="06XXXXXXXX" 
                required 
                minLength="5"
                className="insta-input"
                dir="ltr"
              />
            </div>

            {/* حقل الباسورد + زر الإظهار/الإخفاء */}
            <div className="input-group" style={{ position: "relative" }}>
              <label>كلمة المرور</label>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
                required 
                minLength="3"
                className="insta-input"
                style={{ paddingLeft: "45px" }}
              />
              <button 
                type="button" 
                className="toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* أزرار اختيار الدور (ستايل انستغرام) */}
            <div className="role-selector">
              {Object.keys(roleConfig).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`role-btn ${role === k ? "active" : ""}`}
                  onClick={() => { setRole(k); setLoading(false); }}
                  title={roleConfig[k].label}
                  style={{ "--btn-color": roleConfig[k].color }}
                >
                  {roleConfig[k].icon}
                </button>
              ))}
            </div>
            <div className="selected-role">تسجيل الدخول كـ: <strong>{current.label}</strong></div>

            {/* زر الإرسال مع حالة التحميل */}
            <button type="submit" className="submit-btn" disabled={loading} style={{ "--btn-color": current.color }}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  جاري الدخول...
                </>
              ) : (
                `دخول كـ ${current.label}`
              )}
            </button>

          </form>

          {/* تذييل بسيط */}
          <div className="login-footer">
            <p>هل نسيت كلمة المرور؟ <span className="link">استعادة الحساب</span></p>
            <p className="copyright">© 2026 MediCare Pro. جميع الحقوق محفوظة.</p>
          </div>

        </div>
      </div>
    </div>
  );
}