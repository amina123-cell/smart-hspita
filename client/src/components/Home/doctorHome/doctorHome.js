import React, { useState, useEffect } from "react";
import "./doctorHome.css";

export default function DoctorHome({ userId, onNavigate }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) { 
      setError("⚠️ لم يتم تحديد معرف الطبيب"); 
      setLoading(false); 
      return; 
    }

    const fetchDoctor = async () => {
      try {
        const res = await fetch(`http://localhost:5000/doctors/${userId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "فشل في جلب البيانات");
        }
        const data = await res.json();
        setDoctor(data);
      } catch (err) { 
        setError(err.message); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchDoctor();
  }, [userId]);

  // ✅ دالة الاسم الكامل
  const getFullName = () => {
    if (!doctor) return "";
    const first = doctor.firstName || '';
    const last = doctor.lastName || doctor.familyName || '';
    return `${first} ${last}`.trim() || "طبيب";
  };

  if (loading) return <div className="home-container"><div className="loader">⏳ جاري التحميل...</div></div>;
  if (error) return <div className="home-container"><div className="error-box">❌ {error}</div></div>;
  if (!doctor) return null;

  return (
    <div className="doctor-home-container">
      <div className="doctor-dashboard-grid">
        
        {/* 👨‍⚕️ بطاقة المعلومات الشخصية */}
        <div className="doctor-profile-card">
          <div className="profile-header">
            <div className="avatar-circle doctor-avatar">
              {doctor.profilePicture ? (
                <img src={doctor.profilePicture} alt="Doctor" />
              ) : (
                <span>👨‍⚕️</span>
              )}
            </div>
            <h2>{getFullName()}</h2>
            <span className="specialty-badge">
              {Array.isArray(doctor.specializations) ? doctor.specializations[0] : doctor.specialization || "طب عام"}
            </span>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="icon">🏥</span>
              <span>{doctor.department || "غير محدد"}</span>
            </div>
            <div className="detail-row">
              <span className="icon">📱</span>
              <span>{doctor.phoneNumber || "غير محدد"}</span>
            </div>
            <div className="detail-row">
              <span className="icon">📜</span>
              <span>{doctor.licenseNumber || "غير محدد"}</span>
            </div>
            <div className="detail-row">
              <span className={`icon ${doctor.isActive ? 'active' : 'inactive'}`}>
                {doctor.isActive ? '✅' : '⛔'}
              </span>
              <span>{doctor.isActive ? "نشط" : "غير مفعل"}</span>
            </div>
          </div>

          <div className="profile-actions">
             <button className="btn btn-outline full-width" onClick={() => onNavigate?.("login")}>
              🚪 تسجيل الخروج
            </button>
          </div>
        </div>

        {/* 📋 قسم الإجراءات السريعة */}
        <div className="tasks-section">
          <div className="section-header">
            <h3>📋 لوحة التحكم الطبية</h3>
          </div>

          <div className="quick-actions-grid">
            <div className="action-card" onClick={() => onNavigate?.("addConsultationDoctor")}>
              <div className="card-icon">➕</div>
              <h4>إضافة استشارة</h4>
              <p>تسجيل حالة لمريض جديد</p>
            </div>
            
            <div className="action-card" onClick={() => onNavigate?.("doctor")}>
              <div className="card-icon">👥</div>
              <h4>قائمة المرضى</h4>
              <p>عرض ومتابعة الملفات</p>
            </div>

            <div className="action-card" onClick={() => onNavigate?.("skinAnalysis")}>
              <div className="card-icon">🤖</div>
              <h4>تحليل AI</h4>
              <p>مساعدة الذكاء الاصطناعي</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}