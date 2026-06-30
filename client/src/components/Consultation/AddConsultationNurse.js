import React, { useState, useEffect } from 'react';
import './AddConsultationNurse.css';
// ✅ استيراد دوال المنطق الذكي (تأكد من وجود الملف في المسار الصحيح)
import { getVitalStatus, calculateAutoTriage } from '../../utils/vitalSignsLogic'; 

export default function AddConsultationNurse({ nurseId, onNavigate }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // ✅ حالة النموذج الأساسية
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    type: 'Instant',
    notes: '',
    consultationDate: ''
  });

  // ✅ حالة العلامات الحيوية والتصنيف التلقائي
  const [vitals, setVitals] = useState({ systolicBP: '', heartRate: '', spO2: '', temperature: '' });
  const [autoResult, setAutoResult] = useState(null);
  
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  // جلب القوائم
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch('http://localhost:5000/patients'),
          fetch('http://localhost:5000/doctors')
        ]);
        
        if (patientsRes.ok) setPatients(await patientsRes.json());
        if (doctorsRes.ok) setDoctors(await doctorsRes.json());
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ تحديث العلامات الحيوية وحساب الخطورة تلقائياً
  const handleVitalChange = (field, value) => {
    const newVitals = { ...vitals, [field]: value };
    setVitals(newVitals);
    
    // الحساب التلقائي يحدث مع كل رقم يكتبه الممرض
    const result = calculateAutoTriage(newVitals);
    setAutoResult(result);
  };

  const getFullName = (person) => {
    if (!person) return "";
    return `${person.firstName || ''} ${person.familyName || person.lastName || ''}`.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      if (!formData.patientId) throw new Error('يرجى اختيار مريض');
      if (!formData.doctorId) throw new Error('يرجى اختيار طبيب');
      if (!formData.notes.trim()) throw new Error('يرجى كتابة الملاحظات');
      
      if (formData.type === 'Scheduled' && !formData.consultationDate) {
        throw new Error('يرجى تحديد التاريخ للاستشارات المجدولة');
      }

      const finalDate = formData.type === 'Instant' 
        ? new Date().toISOString() 
        : new Date(formData.consultationDate).toISOString();

      // ✅ تصفية العلامات الحيوية الفارغة
      const cleanVitals = Object.fromEntries(
        Object.entries(vitals).filter(([_, v]) => v !== '')
      );

      const payload = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        nurseId: nurseId,
        type: formData.type,
        notes: formData.notes.trim(),
        consultationDate: finalDate,
        
        // ✅ إضافة بيانات التريج والعلامات الحيوية
        triageLevel: autoResult?.level || 'LEVEL_3',
        vitalSigns: Object.keys(cleanVitals).length > 0 ? cleanVitals : undefined,
        triageSource: Object.keys(cleanVitals).length > 0 ? 'CLINICAL_MEASUREMENT' : 'SELF_REPORTED',
        userId: nurseId,
        userModel: 'Nurse',
        reason: autoResult ? `تصنيف تلقائي: ${autoResult.text}` : 'تسجيل روتيني'
      };

      const res = await fetch('http://localhost:5000/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل في إضافة الاستشارة');

      setStatus({ loading: false, success: true, error: '' });
      
      setTimeout(() => {
        if (onNavigate) onNavigate('nurseHome');
      }, 2000);

    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  const fields = [
    { key: 'systolicBP', label: 'ضغط الدم', unit: 'mmHg', placeholder: '120' },
    { key: 'heartRate', label: 'النبض', unit: 'BPM', placeholder: '72' },
    { key: 'spO2', label: 'التشبع', unit: '%', placeholder: '98' },
    { key: 'temperature', label: 'الحرارة', unit: '°C', placeholder: '36.6' }
  ];

  return (
    <div className="nurse-consult-container">
      <div className="consult-card">
        <div className="card-header nurse-theme">
          <h2>👩‍⚕️ تسجيل واستقبال مريض</h2>
          <p>قم بتوجيه المريض وتحديد أولويته الطبية</p>
        </div>

        {status.success && <div className="alert success">✅ تم تسجيل الاستشارة وتصنيف الحالة بنجاح!</div>}
        {status.error && <div className="alert error">❌ {status.error}</div>}

        <form onSubmit={handleSubmit} className="consult-form">
          
          {/* 🔹 اختيار المريض */}
          <div className="form-group">
            <label>المريض *</label>
            {loadingData ? <div className="loading-text">جاري التحميل...</div> : (
              <select name="patientId" value={formData.patientId} onChange={handleChange} required>
                <option value="">-- اختر المريض --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{getFullName(p)} - {p.phoneNumber}</option>
                ))}
              </select>
            )}
          </div>

          {/* 🔹 اختيار الطبيب */}
          <div className="form-group">
            <label>الطبيب المعالج *</label>
            {loadingData ? <div className="loading-text">جاري التحميل...</div> : (
              <select name="doctorId" value={formData.doctorId} onChange={handleChange} required>
                <option value="">-- اختر الطبيب --</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>د. {getFullName(d)} - {d.department || 'عام'}</option>
                ))}
              </select>
            )}
          </div>

          {/* ✅ قسم العلامات الحيوية الذكي */}
          <div className="smart-vitals-section">
            <label>العلامات الحيوية (التصنيف التلقائي)</label>
            <div className="vitals-grid">
              {fields.map(field => {
                const statusColor = getVitalStatus(field.key, vitals[field.key]).color;
                return (
                  <div key={field.key} className="vital-input-wrapper" style={{ borderColor: statusColor }}>
                    <input 
                      type="number" 
                      placeholder={field.label}
                      value={vitals[field.key]}
                      onChange={e => handleVitalChange(field.key, e.target.value)}
                      style={{ color: statusColor }}
                    />
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
                <strong>الحالة المقترحة:</strong> {autoResult.text}
              </div>
            )}
          </div>

          {/* 🔹 نوع الاستشارة */}
          <div className="form-group">
            <label>نوع الاستشارة *</label>
            <div className="radio-group">
              <label className={`radio-label ${formData.type === 'Instant' ? 'active' : ''}`}>
                <input type="radio" name="type" value="Instant" checked={formData.type === 'Instant'} onChange={handleChange} />
                ⚡ فورية
              </label>
              <label className={`radio-label ${formData.type === 'Scheduled' ? 'active' : ''}`}>
                <input type="radio" name="type" value="Scheduled" checked={formData.type === 'Scheduled'} onChange={handleChange} />
                📅 مجدولة
              </label>
            </div>
          </div>

          {formData.type === 'Scheduled' && (
            <div className="form-group animate-fade">
              <label>تاريخ ووقت الموعد *</label>
              <input type="datetime-local" name="consultationDate" value={formData.consultationDate} onChange={handleChange} required min={new Date().toISOString().slice(0,16)} />
            </div>
          )}

          {/* 🔹 الملاحظات */}
          <div className="form-group">
            <label>ملاحظات التمريض والأعراض الأولية *</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" required placeholder="سجل هنا الشكوى الرئيسية..." />
          </div>

          {/* 🔘 الأزرار */}
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={status.loading}>
              {status.loading ? '⏳ جاري الحفظ...' : '💾 حفظ وتوجيه'}
            </button>
            <button type="button" className="btn-cancel" onClick={() => onNavigate?.('nurseHome')}>إلغاء</button>
          </div>

        </form>
      </div>
    </div>
  );
}