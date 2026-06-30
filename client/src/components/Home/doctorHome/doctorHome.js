import React, { useState, useEffect } from "react";
import axios from "axios";
// ✅ استيراد مكون العلامات الحيوية الذكي
import SmartVitalsSection from "../../Shared/SmartVitalsSection"; 
import "./doctorHome.css";

const TRIAGE_STYLES = {
  LEVEL_1: { bg: '#ef4444', label: 'إنعاش', icon: '🚨' },
  LEVEL_2: { bg: '#f97316', label: 'طارئ', icon: '' },
  LEVEL_3: { bg: '#eab308', label: 'عاجل', icon: '' },
  LEVEL_4: { bg: '#3b82f6', label: 'أقل إلحاحاً', icon: '📋' },
  LEVEL_5: { bg: '#22c55e', label: 'غير عاجل', icon: '✅' }
};

export default function DoctorHome({ userId, onNavigate }) {
  const [doctor, setDoctor] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [selectedConsult, setSelectedConsult] = useState(null); // ✅ لتحديد مريض لعرض علاماته
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) { 
      setError("⚠️ لم يتم تحديد معرف الطبيب"); 
      setLoading(false); 
      return; 
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const doctorRes = await fetch(`http://localhost:5000/doctors/${userId}`, { headers });
        if (!doctorRes.ok) throw new Error("فشل في جلب بيانات الطبيب");
        const doctorData = await doctorRes.json();
        setDoctor(doctorData.data || doctorData);

        const consultRes = await fetch(`http://localhost:5000/consultations/doctor/${userId}`, { headers });
        if (consultRes.ok) {
          const result = await consultRes.json();
          let consults = result.data || result;
          
          const sortedConsults = [...consults].sort((a, b) => {
            const priorityMap = { 'LEVEL_1': 1, 'LEVEL_2': 2, 'LEVEL_3': 3, 'LEVEL_4': 4, 'LEVEL_5': 5 };
            const pA = priorityMap[a.triageLevel] || 3;
            const pB = priorityMap[b.triageLevel] || 3;
            return pA - pB || new Date(b.createdAt) - new Date(a.createdAt);
          });

          setConsultations(sortedConsults);
          // اختيار أول مريض تلقائياً لعرض علاماته
          if (sortedConsults.length > 0) setSelectedConsult(sortedConsults[0]);
        }

      } catch (err) { 
        setError(err.message); 
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchData();
  }, [userId]);

  // ✅ دالة تحديث العلامات الحيوية من طرف الطبيب
  const handleUpdateVitals = async (newVitals) => {
    if (!selectedConsult) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/consultations/${selectedConsult._id}/triage`, {
        vitalSigns: newVitals,
        userId: userId,
        userModel: 'Doctor',
        reason: 'تحديث طبي أثناء الكشف'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("✅ تم تحديث العلامات الحيوية بنجاح");
      // إعادة تحميل البيانات لتحديث القائمة
      window.location.reload(); 
    } catch (err) {
      alert("❌ فشل في حفظ التحديثات");
    }
  };

  const getFullName = () => {
    if (!doctor) return "";
    return `${doctor.firstName || ''} ${doctor.lastName || doctor.familyName || ''}`.trim() || "طبيب";
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
              {doctor.profilePicture ? <img src={doctor.profilePicture} alt="Doctor" /> : <span>👨‍⚕️</span>}
            </div>
            <h2>{getFullName()}</h2>
            <span className="specialty-badge">
              {Array.isArray(doctor.specializations) ? doctor.specializations[0] : doctor.specialization || "طب عام"}
            </span>
          </div>
          <div className="profile-details">
            <div className="detail-row"><span className="icon">🏥</span><span>{doctor.department || "غير محدد"}</span></div>
            <div className="detail-row"><span className="icon">📱</span><span>{doctor.phoneNumber || "غير محدد"}</span></div>
          </div>
          <div className="profile-actions">
             <button className="btn btn-outline full-width" onClick={() => onNavigate?.("login")}>🚪 تسجيل الخروج</button>
          </div>
        </div>

        {/* 📋 القسم الرئيسي: قائمة الانتظار + العلامات الحيوية */}
        <div className="tasks-section">
          <div className="section-header">
            <h3>📋 لوحة التحكم الطبية</h3>
          </div>

          <div className="main-workspace">
            {/* الجزء الأيسر: قائمة الانتظار */}
            <div className="queue-list-container">
              <h4>🚨 قائمة الانتظار ({consultations.length})</h4>
              <div className="queue-list">
                {consultations.map(consult => {
                  const style = TRIAGE_STYLES[consult.triageLevel] || TRIAGE_STYLES.LEVEL_3;
                  const isSelected = selectedConsult?._id === consult._id;
                  
                  return (
                    <div key={consult._id} 
                         className={`queue-item ${isSelected ? 'selected' : ''}`} 
                         onClick={() => setSelectedConsult(consult)}
                         style={{ borderRight: `4px solid ${style.bg}` }}>
                      
                      <div className="queue-info">
                        <strong>{consult.patientId?.firstName} {consult.patientId?.familyName}</strong>
                        <small>{style.label}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* الجزء الأيمن: تفاصيل وعلامات المريض المختار */}
            {selectedConsult && (
              <div className="patient-detail-view">
                <div className="patient-header">
                  <h3>👤 ملف المريض: {selectedConsult.patientId?.firstName}</h3>
                  <span className={`triage-badge ${selectedConsult.triageLevel}`}>
                    {TRIAGE_STYLES[selectedConsult.triageLevel]?.label}
                  </span>
                </div>

                {/* ✅ هنا فين كيتحط مكون العلامات الحيوية */}
                <SmartVitalsSection 
                  initialVitals={selectedConsult.vitalSigns || {}}
                  userRole="doctor"
                  consultationId={selectedConsult._id}
                  onUpdate={handleUpdateVitals}
                />

                <div className="notes-preview">
                  <h4>ملاحظات الدخول:</h4>
                  <p>{selectedConsult.notes || "لا توجد ملاحظات"}</p>
                </div>

                <button className="btn-start-consult" onClick={() => alert(`بدء الكشف على ${selectedConsult.patientId?.firstName}`)}>
                  🩺 بدء الكشف الطبي
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}