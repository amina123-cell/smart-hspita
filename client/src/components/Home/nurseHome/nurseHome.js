import React, { useState, useEffect, useCallback } from "react";
import "./nurseHome.css";

export default function NurseHome({ userId, onNavigate }) {
  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ جلب بيانات الممرضة
  useEffect(() => {
    if (!userId) { 
      setError("⚠️ لم يتم تحديد معرف الممرض"); 
      setLoading(false); 
      return; 
    }

    const fetchNurse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/nurses/${userId}`);
        if (!res.ok) throw new Error("فشل في جلب البيانات");
        const data = await res.json();
        setNurse(data);
      } catch (err) { 
        setError(err.message); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchNurse();
  }, [userId]);

  // ✅ دالة الاسم الكامل
  const getFullName = () => {
    if (!nurse) return "";
    const first = nurse.firstName || '';
    const last = nurse.lastName || nurse.familyName || '';
    return `${first} ${last}`.trim() || "ممرض";
  };

  if (loading) return <div className="home-container"><div className="loader">⏳ جاري التحميل...</div></div>;
  if (error) return <div className="home-container"><div className="error-box">❌ {error}</div></div>;
  if (!nurse) return null;

  return (
    <div className="nurse-home-container">
      <div className="nurse-dashboard-grid">
        
        {/* 👩‍⚕️ بطاقة المعلومات الشخصية */}
        <div className="nurse-profile-card">
          <div className="profile-header">
            <div className="avatar-circle nurse-avatar">
              {nurse.profilePicture ? (
                <img src={nurse.profilePicture} alt="Nurse" />
              ) : (
                <span>👩‍⚕️</span>
              )}
            </div>
            <h2>{getFullName()}</h2>
            <span className="dept-badge">{nurse.department || "قسم التمريض"}</span>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="icon">📱</span>
              <span>{nurse.phoneNumber || "غير محدد"}</span>
            </div>
            <div className="detail-row">
              <span className="icon">🕒</span>
              <span>{nurse.shiftPreference || "غير محدد"}</span>
            </div>
            <div className="detail-row">
              <span className="icon">🆔</span>
              <span>{nurse.licenseNumber || "غير محدد"}</span>
            </div>
            <div className="detail-row">
              <span className={`icon ${nurse.isActive ? 'active' : 'inactive'}`}>
                {nurse.isActive ? '✅' : '⛔'}
              </span>
              <span>{nurse.isActive ? "نشط" : "غير مفعل"}</span>
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
            <h3>📋 لوحة المهام والاستشارات</h3>
          </div>

          <div className="quick-actions-grid">
            <div className="action-card" onClick={() => onNavigate?.("addConsultationNurse")}>
              <div className="card-icon">➕</div>
              <h4>تسجيل استشارة جديدة</h4>
              <p>توجيه مريض لطبيب مختص</p>
            </div>
            
            <div className="action-card" onClick={() => onNavigate?.("nurse")}>
              <div className="card-icon">📋</div>
              <h4>قائمة المهام</h4>
              <p>عرض المتابعات اليومية</p>
            </div>

            <div className="action-card" onClick={() => onNavigate?.("addPatient")}>
              <div className="card-icon">🤒</div>
              <h4>تسجيل مريض</h4>
              <p>إضافة ملف مريض جديد</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}