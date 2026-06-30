import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
// ✅ استيراد منطق الذكاء الاصطناعي للتلوين والتصنيف
import { getVitalStatus, calculateAutoTriage } from "../../../utils/vitalSignsLogic";
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

  // ✅ حالات جديدة لإدخال العلامات الحيوية
  const [vitalsForm, setVitalsForm] = useState({ systolicBP: '', heartRate: '', spO2: '', temperature: '' });
  const [autoResult, setAutoResult] = useState(null);
  const [savingVitals, setSavingVitals] = useState(false);

  // ✅ حالات الذكاء الاصطناعي
  const [aiImage, setAiImage] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

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

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const patientRes = await fetch(`http://localhost:5000/patients/${userId}`, { headers });
      if (!patientRes.ok) throw new Error("فشل في جلب بيانات المريض");
      const patientData = await patientRes.json();
      setPatient(patientData.data || patientData);

      const consultRes = await fetch(`http://localhost:5000/consultations/patient/${userId}`, { headers });
      if (consultRes.ok) {
        const result = await consultRes.json();
        const consults = result.data || result; 
        setConsultations(Array.isArray(consults) ? consults : []);
      }
    } catch (err) {
      console.error("💥 Fetch Error:", err);
      if (err.message.includes('401')) {
        setError("⚠️ انتهت صلاحية الجلسة");
        setTimeout(() => onNavigate?.('login'), 2000);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, onNavigate]);

  useEffect(() => { 
    fetchPatientData(); 
  }, [fetchPatientData]);

  // ✅ معالجة تغيير حقول العلامات الحيوية مع التلوين الفوري
  const handleVitalChange = (field, value) => {
    const newVitals = { ...vitalsForm, [field]: value };
    setVitalsForm(newVitals);
    setAutoResult(calculateAutoTriage(newVitals));
  };

  // ✅ حفظ العلامات الحيوية وتحديث ملف المريض + إشعار الطبيب
  const handleSubmitVitals = async (e) => {
    e.preventDefault();
    if (!vitalsForm.systolicBP && !vitalsForm.heartRate) {
      toast.warning("يرجى إدخال علامة حيوية واحدة على الأقل");
      return;
    }

    setSavingVitals(true);
    try {
      const token = localStorage.getItem('token');
      
      // ✅ البحث عن آخر استشارة معلقة (سواء فورية أو مجدولة) لربط القياسات بها
      const pendingConsult = consultations.find(c => c.status === 'Pending');
      
      await axios.put(`http://localhost:5000/patients/${userId}/update-vitals`, {
        vitalSigns: vitalsForm,
        triageLevel: autoResult?.level || 'LEVEL_3',
        notes: 'قياس ذاتي حديث من الصفحة الرئيسية',
        consultationId: pendingConsult ? pendingConsult._id : null // ✅ ربط القياس بالاستشارة إن وجدت
      }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      toast.success("✅ تم تحديث ملفك الطبي وإشعار طبيبك!");
      setVitalsForm({ systolicBP: '', heartRate: '', spO2: '', temperature: '' });
      setAutoResult(null);
      fetchPatientData(); // تحديث الواجهة
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "فشل في حفظ البيانات");
    } finally {
      setSavingVitals(false);
    }
  };

  // ✅ دالة معالجة رفع الصورة وتحليلها
  const handleAiUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiImage(URL.createObjectURL(file));
    setAiResult(null);
    setAiLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAiResult(res.data.prediction || res.data.class_name || "تم التحليل بنجاح");
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiResult("⚠️ حدث خطأ أثناء تحليل الصورة.");
    } finally {
      setAiLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "-";
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('ar-DZ', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredConsults = consultations.filter(c => {
    const matchesSearch = 
      c.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="patient-home-container">
      <div className="loader-wrapper"><div className="loader-spinner"></div><p>⏳ جاري تحميل بياناتك...</p></div>
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

  const fields = [
    { key: 'systolicBP', label: 'ضغط الدم', unit: 'mmHg', placeholder: '120' },
    { key: 'heartRate', label: 'النبض', unit: 'BPM', placeholder: '72' },
    { key: 'spO2', label: 'التشبع', unit: '%', placeholder: '98' },
    { key: 'temperature', label: 'الحرارة', unit: '°C', placeholder: '36.6' }
  ];

  return (
    <div className="patient-home-container">
      <div className="patient-dashboard-grid">
        
        {/* بطاقة المعلومات الشخصية */}
        <div className="patient-profile-card">
          <div className="profile-header">
            <div className="avatar-circle">
              {patient.profilePicture ? <img src={patient.profilePicture} alt="Profile" /> : <span className="avatar-icon">👤</span>}
            </div>
            <h2>{patient.firstName} {patient.familyName}</h2>
            <span className="patient-id-badge">ID: {patient._id?.slice(-6).toUpperCase()}</span>
          </div>

          <div className="profile-details">
            <div className="detail-row"><span className="icon">📱</span><span>{patient.phoneNumber || "غير محدد"}</span></div>
            <div className="detail-row"><span className="icon">🩸</span><span>{patient.bloodGroup || "غير محدد"}</span></div>
            <div className="detail-row"><span className="icon">🎂</span><span>{calculateAge(patient.dateOfBirth)} سنة</span></div>
            <div className="detail-row"><span className="icon">🛡️</span><span>{patient.insuranceStatus === "active" ? "تأمين نشط" : "بدون تأمين"}</span></div>
          </div>

          <div className="profile-actions">
            <button className="btn btn-outline full-width" onClick={() => onNavigate?.("patient")}>📋 عرض الملف الكامل</button>
          </div>
        </div>

        {/* ✅ قسم إدخال العلامات الحيوية الذاتي (الجديد) */}
        <div className="self-vitals-card">
          <div className="section-header">
            <h3>🩺 سجل علاماتك الحيوية الحالية</h3>
            <span className="ai-badge">تقييم فوري</span>
          </div>
          
          <form onSubmit={handleSubmitVitals} className="vitals-input-form">
            <div className="vitals-grid">
              {fields.map(field => {
                const status = getVitalStatus(field.key, vitalsForm[field.key]);
                return (
                  <div key={field.key} className="vital-input-box" style={{ borderColor: status.color }}>
                    <label>{field.label}</label>
                    <input 
                      type="number" 
                      placeholder={field.placeholder}
                      value={vitalsForm[field.key]}
                      onChange={e => handleVitalChange(field.key, e.target.value)}
                      style={{ color: status.color }}
                    />
                    <small style={{ color: status.color }}>{status.label !== '-' ? status.label : ''}</small>
                  </div>
                );
              })}
            </div>

            {/* شريط النتيجة التلقائية */}
            {autoResult && (
              <div className="auto-triage-banner" style={{ 
                backgroundColor: `${autoResult.color}15`, 
                borderRight: `4px solid ${autoResult.color}`,
                color: autoResult.color 
              }}>
                <strong>التقييم المبدئي:</strong> {autoResult.text}
              </div>
            )}

            <button type="submit" className="btn-primary full-width" disabled={savingVitals}>
              {savingVitals ? '⏳ جاري الحفظ...' : '💾 حفظ القياسات الجديدة'}
            </button>
          </form>
        </div>

        {/* قسم الذكاء الاصطناعي */}
        <div className="ai-analysis-card">
          <div className="section-header">
            <h3>🧠 MediCare AI - تحليل أولي</h3>
            <span className="ai-badge">Deep Learning</span>
          </div>
          <p className="ai-description">قم برفع صورة للمنطقة المصابة للحصول على توجيه طبي أولي.</p>
          
          <div className="ai-upload-area">
            <input type="file" id="ai-image-input" accept="image/*" onChange={handleAiUpload} disabled={aiLoading} hidden />
            <label htmlFor="ai-image-input" className={`upload-btn ${aiLoading ? 'disabled' : ''}`}>
              {aiLoading ? '⏳ جاري التحليل...' : '📷 رفع صورة للتحليل'}
            </label>
          </div>

          {aiImage && <div className="ai-preview"><img src={aiImage} alt="Preview" /></div>}

          {aiResult && (
            <div className={`ai-result-box ${aiResult.includes('خطأ') ? 'error' : 'success'}`}>
              <h4>نتيجة التحليل:</h4>
              <p>{aiResult}</p>
              <small className="ai-disclaimer">⚠️ هذا التحليل هو توجيه أولي فقط ولا يغني عن استشارة الطبيب.</small>
            </div>
          )}
        </div>

        {/* قسم الاستشارات */}
        <div className="consultations-section full-width">
          <div className="section-header">
            <h3>📅 سجل استشاراتي</h3>
            <button className="btn btn-primary" onClick={() => onNavigate?.("addConsultationPatient")}>➕ طلب استشارة جديدة</button>
          </div>

          <div className="controls-bar">
            <input type="text" placeholder="🔍 بحث..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="Pending">قيد الانتظار</option>
              <option value="Completed">مكتملة</option>
              <option value="Cancelled">ملغاة</option>
            </select>
            <button className="icon-btn" onClick={() => fetchPatientData(true)} disabled={refreshing}>{refreshing ? '⏳' : '🔄'}</button>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr><th>التاريخ</th><th>الطبيب</th><th>النوع</th><th>الحالة</th><th>الإجراءات</th></tr>
              </thead>
              <tbody>
                {filteredConsults.length === 0 ? (
                  <tr><td colSpan="5" className="empty-message">لا توجد استشارات مطابقة</td></tr>
                ) : (
                  filteredConsults.map((c) => (
                    <tr key={c._id}>
                      <td>{formatDate(c.consultationDate)}</td>
                      <td><div className="doctor-cell">{c.doctorName || "غير محدد"}</div></td>
                      <td><span className={`type-badge ${c.type}`}>{c.type === 'Instant' ? '⚡ فورية' : '📅 مجدولة'}</span></td>
                      <td><span className={`status-badge ${c.status}`}>{c.status === 'Pending' ? '⏳ انتظار' : c.status === 'Completed' ? '✅ مكتملة' : '❌ ملغاة'}</span></td>
                      <td><button className="btn-sm btn-view" onClick={() => setSelectedConsult(c)}>👁️ تفاصيل</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedConsult && (
        <ConsultationModal consult={selectedConsult} formatDate={formatDate} onClose={() => setSelectedConsult(null)} />
      )}
    </div>
  );
}

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
            <div className="info-item"><label>التاريخ:</label><span>{formatDate(consult.consultationDate)}</span></div>
            <div className="info-item"><label>الطبيب:</label><span>{consult.doctorName || "-"}</span></div>
            <div className="info-item"><label>النوع:</label><span>{consult.type === 'Instant' ? '⚡ فورية' : '📅 مجدولة'}</span></div>
            <div className="info-item"><label>الحالة:</label><span className={`status-text ${consult.status}`}>{consult.status}</span></div>
          </div>
          <div className="notes-section">
            <label>الملاحظات والأعراض:</label>
            <p>{consult.notes || "لا توجد ملاحظات"}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}