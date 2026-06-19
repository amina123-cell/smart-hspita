import React, { useState, useEffect, useCallback } from "react";
import "./patientHome.css";

export default function PatientHome({ userId, onNavigate }) {
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedConsult, setSelectedConsult] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ دالة جلب البيانات
  const fetchPatientData = useCallback(async (showRefresh = false) => {
    if (!userId) {
      setError("⚠️ لم يتم تحديد معرف المريض");
      setLoading(false);
      return;
    }

    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // 1. جلب بيانات المريض الشخصية
      const patientRes = await fetch(`http://localhost:5000/patients/${userId}`);
      if (!patientRes.ok) throw new Error("فشل في جلب بيانات المريض");
      const patientData = await patientRes.json();
      setPatient(patientData);

      // 2. جلب استشارات المريض
      // ملاحظة: نستخدم المسار الذي أنشأناه سابقاً getPatientConsultations
      const consultRes = await fetch(`http://localhost:5000/consultations/patient/${userId}`);
      if (consultRes.ok) {
        const result = await consultRes.json();
        // تأكد من شكل البيانات القادمة من السيرفر (غالباً تكون داخل data أو مباشرة مصفوفة)
        const consults = result.data || result; 
        setConsultations(Array.isArray(consults) ? consults : []);
      }
    } catch (err) {
      console.error("💥 Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { 
    fetchPatientData(); 
  }, [fetchPatientData]);

  // ✅ حساب العمر
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "-";
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // ✅ تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('ar-DZ', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // ✅ فلترة الجدول
  const filteredConsults = consultations.filter(c => {
    const matchesSearch = 
      c.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ✅ حالات العرض
  if (loading) return (
    <div className="patient-home-container">
      <div className="loader-wrapper">
        <div className="loader-spinner"></div>
        <p>⏳ جاري تحميل بياناتك...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="patient-home-container">
      <div className="error-card">
        <h3>❌ حدث خطأ</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => fetchPatientData()}>🔄 إعادة المحاولة</button>
      </div>
    </div>
  );

  if (!patient) return null;

  return (
    <div className="patient-home-container">
      <div className="patient-dashboard-grid">
        
        {/* 👤 بطاقة المعلومات الشخصية */}
        <div className="patient-profile-card">
          <div className="profile-header">
            <div className="avatar-circle">
              {patient.profilePicture ? (
                <img src={patient.profilePicture} alt="Profile" />
              ) : (
                <span className="avatar-icon">👤</span>
              )}
            </div>
            <h2>{patient.firstName} {patient.familyName}</h2>
            <span className="patient-id-badge">ID: {patient._id?.slice(-6).toUpperCase()}</span>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="icon">📱</span>
              <span>{patient.phoneNumber || "غير محدد"}</span>
            </div>
            <div className="detail-row">
              <span className="icon">🩸</span>
              <span>{patient.bloodGroup || "غير محدد"}</span>
            </div>
            <div className="detail-row">
              <span className="icon">🎂</span>
              <span>{calculateAge(patient.dateOfBirth)} سنة</span>
            </div>
            <div className="detail-row">
              <span className="icon">🛡️</span>
              <span>{patient.insuranceStatus === "active" ? "تأمين نشط" : "بدون تأمين"}</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn btn-outline full-width" onClick={() => onNavigate?.("patient")}>
              📋 عرض الملف الكامل
            </button>
          </div>
        </div>

        {/* 📋 قسم الاستشارات */}
        <div className="consultations-section">
          <div className="section-header">
            <h3>📅 سجل استشاراتي</h3>
            <button 
              className="btn btn-primary" 
              onClick={() => onNavigate?.("addConsultationPatient")}
            >
              ➕ طلب استشارة جديدة
            </button>
          </div>

          {/* أدوات التحكم والفلترة */}
          <div className="controls-bar">
            <input 
              type="text" 
              placeholder="🔍 بحث في الملاحظات أو اسم الطبيب..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="filter-select" 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="Pending">⏳ قيد الانتظار</option>
              <option value="Completed">✅ مكتملة</option>
              <option value="Cancelled">❌ ملغاة</option>
            </select>
            <button className="icon-btn" onClick={() => fetchPatientData(true)} disabled={refreshing}>
              {refreshing ? '⏳' : '🔄'}
            </button>
          </div>

          {/* جدول الاستشارات */}
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الطبيب</th>
                  <th>النوع</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsults.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-message">لا توجد استشارات مطابقة</td>
                  </tr>
                ) : (
                  filteredConsults.map((c) => (
                    <tr key={c._id}>
                      <td>{formatDate(c.consultationDate)}</td>
                      <td>
                        <div className="doctor-cell">
                          <span className="doc-icon">👨‍⚕️</span>
                          {c.doctorName || "غير محدد"}
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${c.type}`}>
                          {c.type === 'Instant' ? '⚡ فورية' : '📅 مجدولة'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${c.status}`}>
                          {c.status === 'Pending' ? '⏳ انتظار' : 
                           c.status === 'Completed' ? '✅ مكتملة' : '❌ ملغاة'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-sm btn-view" 
                          onClick={() => setSelectedConsult(c)}
                        >
                          👁️ تفاصيل
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 🪟 نافذة التفاصيل (Modal) */}
      {selectedConsult && (
        <ConsultationModal 
          consult={selectedConsult} 
          formatDate={formatDate} 
          onClose={() => setSelectedConsult(null)} 
        />
      )}
    </div>
  );
}

// ✅ مكون النافذة المنبثقة للتفاصيل
function ConsultationModal({ consult, formatDate, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📋 تفاصيل الاستشارة</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="info-grid">
            <div className="info-item">
              <label>التاريخ:</label>
              <span>{formatDate(consult.consultationDate)}</span>
            </div>
            <div className="info-item">
              <label>الطبيب:</label>
              <span>{consult.doctorName || "-"}</span>
            </div>
            <div className="info-item">
              <label>النوع:</label>
              <span>{consult.type === 'Instant' ? '⚡ فورية' : '📅 مجدولة'}</span>
            </div>
            <div className="info-item">
              <label>الحالة:</label>
              <span className={`status-text ${consult.status}`}>
                {consult.status === 'Pending' ? 'قيد الانتظار' : 
                 consult.status === 'Completed' ? 'مكتملة' : 'ملغاة'}
              </span>
            </div>
          </div>
          
          <div className="notes-section">
            <label>الملاحظات والأعراض:</label>
            <p>{consult.notes || "لا توجد ملاحظات"}</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>إغلاق</button>
          {consult.status === 'Pending' && (
            <button className="btn btn-primary">📞 تواصل مع العيادة</button>
          )}
        </div>
      </div>
    </div>
  );
}