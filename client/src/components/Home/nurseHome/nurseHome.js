import React, { useState, useEffect } from "react";
import axios from "axios";
// ✅ استيراد مكون العلامات الحيوية الذكي
import SmartVitalsSection from "../../Shared/SmartVitalsSection"; 
import "./nurseHome.css";

export default function NurseHome({ userId, onNavigate }) {
  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ حالات جديدة لإدارة قياسات المريض
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [currentVitals, setCurrentVitals] = useState({});

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

  // ✅ دالة حفظ العلامات الحيوية للمريض المختار
  const handleSaveVitals = async (vitalsData) => {
    if (!selectedPatientId) {
      alert("⚠️ يرجى اختيار مريض أولاً من القائمة");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // إرسال التحديث للسيرفر
      await axios.put(`http://localhost:5000/patients/${selectedPatientId}/vitals`, {
        vitalSigns: vitalsData,
        enteredBy: 'NURSE_CLINICAL_CHECK'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("✅ تم تسجيل العلامات الحيوية بنجاح!");
      setCurrentVitals(vitalsData); // تحديث العرض المحلي
    } catch (err) {
      console.error(err);
      alert("❌ حدث خطأ أثناء الحفظ");
    }
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
              {nurse.profilePicture ? <img src={nurse.profilePicture} alt="Nurse" /> : <span>👩‍⚕️</span>}
            </div>
            <h2>{getFullName()}</h2>
            <span className="dept-badge">{nurse.department || "قسم التمريض"}</span>
          </div>

          <div className="profile-details">
            <div className="detail-row"><span className="icon">📱</span><span>{nurse.phoneNumber || "غير محدد"}</span></div>
            <div className="detail-row"><span className="icon">🕒</span><span>{nurse.shiftPreference || "غير محدد"}</span></div>
            <div className="detail-row"><span className="icon">🆔</span><span>{nurse.licenseNumber || "غير محدد"}</span></div>
            <div className="detail-row">
              <span className={`icon ${nurse.isActive ? 'active' : 'inactive'}`}>
                {nurse.isActive ? '✅' : '⛔'}
              </span>
              <span>{nurse.isActive ? "نشط" : "غير مفعل"}</span>
            </div>
          </div>

          <div className="profile-actions">
             <button className="btn btn-outline full-width" onClick={() => onNavigate?.("login")}>🚪 تسجيل الخروج</button>
          </div>
        </div>

        {/* 📋 قسم الإجراءات والعلامات الحيوية */}
        <div className="tasks-section">
          <div className="section-header">
            <h3>📋 لوحة المهام والقياسات</h3>
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
          </div>

          {/* ✅ قسم العلامات الحيوية الجديد للممرض */}
          <div className="nurse-vitals-workspace">
            <div className="workspace-header">
              <h4>🩺 محطة قياس العلامات الحيوية</h4>
              {/* قائمة منسدلة لاختيار المريض (يمكن استبدالها ببحث متقدم) */}
              <select 
                className="patient-select" 
                onChange={(e) => setSelectedPatientId(e.target.value)}
                value={selectedPatientId}
              >
                <option value="">-- اختر مريضاً للقياس --</option>
                {/* هنا يجب جلب قائمة المرضى، لكن للتبسيط سنعتمد على التنقل */}
                <option value="temp_id">مريض تجريبي (مثال)</option>
              </select>
            </div>

            <SmartVitalsSection 
              initialVitals={currentVitals}
              userRole="nurse"
              consultationId={null} // يمكن ربطها بـ ID الاستشارة النشطة
              onUpdate={handleSaveVitals}
            />
          </div>

        </div>
      </div>
    </div>
  );
}