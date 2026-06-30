import { useState } from "react";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login({ onLogin }) {
  const [role, setRole] = useState("admin");
  const [formData, setFormData] = useState({ phoneNumber: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleConfig = {
    admin:   { label: "أدمن النظام", endpoint: "/auth/admin",   icon: "⚙️", color: "#6366f1", idKey: "adminId" },
    doctor:  { label: "طبيب",        endpoint: "/auth/doctor",  icon: "👨‍⚕️", color: "#3b82f6", idKey: "doctorId" },
    nurse:   { label: "ممرض",        endpoint: "/auth/nurse",   icon: "👩‍⚕️", color: "#06b6d4", idKey: "nurseId" },
    patient: { label: "مريض",        endpoint: "/auth/patient", icon: "👤",  color: "#10b981", idKey: "patientId" }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.phoneNumber.length < 5 || formData.password.length < 3) {
      toast.warning("يرجى التأكد من صحة رقم الهاتف وكلمة المرور");
      return;
    }

    setLoading(true);
    try {
      const { endpoint, idKey, label } = roleConfig[role];
      
      // ✅ استخدام المسار النسبي مع البورت الصحيح إذا لزم الأمر
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "فشل تسجيل الدخول");

      const userId = result[idKey] || result._id || result.id;
      const userName = result.name || `${result.firstName || ''} ${result.familyName || ''}`.trim() || label;
      const token = result.token;

      if (!userId) throw new Error("تم الدخول لكن لم يتم تحديد الهوية");
      if (!token) console.warn("⚠️ لم يتم استلام توكن!");

      // ✅✅✅ الحل الجذري: تخزين التوكن والبيانات محلياً فوراً
      localStorage.setItem('userRole', role);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      if (token) localStorage.setItem('token', token); // هذا السطر هو اللي كان ناقص

      toast.success(`🎉 مرحباً بك، ${userName}`);
      
      setTimeout(() => {
        onLogin?.(role, userId, { name: userName, token, role });
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
      <div className="login-hero">
        <div className="hero-overlay">
          <div className="hero-icon">{current.icon}</div>
          <h2>MediCare Pro</h2>
          <p>منصة طبية متكاملة لإدارة العيادات، المستشفيات، والمرضى</p>
          <div className="hero-badges">
            <span>آمن</span><span>⚡ سريع</span><span>🌐 سحابي</span>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card">
          <h1 className="app-logo">MediCare Pro</h1>
          
          <div className="role-avatar" style={{ "--accent": current.color }}>
            <span className="avatar-icon">{current.icon}</span>
            <span className="avatar-label">{current.label}</span>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label>رقم الهاتف</label>
              <input 
                type="tel" name="phoneNumber" value={formData.phoneNumber} 
                onChange={handleChange} placeholder="06XXXXXXXX" required minLength="5"
                className="insta-input" dir="ltr"
              />
            </div>

            <div className="input-group" style={{ position: "relative" }}>
              <label>كلمة المرور</label>
              <input 
                type={showPassword ? "text" : "password"} name="password" 
                value={formData.password} onChange={handleChange} 
                placeholder="••••••••" required minLength="3"
                className="insta-input" style={{ paddingLeft: "45px" }}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="role-selector">
              {Object.keys(roleConfig).map((k) => (
                <button key={k} type="button" className={`role-btn ${role === k ? "active" : ""}`}
                  onClick={() => { setRole(k); setLoading(false); }}
                  style={{ "--btn-color": roleConfig[k].color }}
                >
                  {roleConfig[k].icon}
                </button>
              ))}
            </div>
            
            <div className="selected-role">تسجيل الدخول كـ: <strong>{current.label}</strong></div>

            <button type="submit" className="submit-btn" disabled={loading} style={{ "--btn-color": current.color }}>
              {loading ? <><span className="spinner"></span> جاري الدخول...</> : `دخول كـ ${current.label}`}
            </button>
          </form>

          <div className="login-footer">
            <p>هل نسيت كلمة المرور؟ <span className="link">استعادة الحساب</span></p>
            <p className="copyright">© 2026 MediCare Pro.</p>
          </div>
        </div>
      </div>
    </div>
  );
}