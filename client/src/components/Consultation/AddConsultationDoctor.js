import React, { useState, useEffect } from 'react';
import './AddConsultationDoctor.css';

// ✅ تعريف مستويات التريج للواجهة
const TRIAGE_LEVELS = [
  { code: 'LEVEL_1', label: 'إنعاش', color: '#ef4444' },
  { code: 'LEVEL_2', label: 'طارئ', color: '#f97316' },
  { code: 'LEVEL_3', label: 'عاجل', color: '#eab308' },
  { code: 'LEVEL_4', label: 'أقل إلحاحاً', color: '#3b82f6' },
  { code: 'LEVEL_5', label: 'غير عاجل', color: '#22c55e' }
];

export default function AddConsultationDoctor({ doctorId, onNavigate }) {
  const [patients, setPatients] = useState([]);
  
  // ✅ حالة النموذج المحدثة لتشمل سبب التصنيف
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'Instant',
    triageLevel: 'LEVEL_3',
    vitalSigns: { systolicBP: '', heartRate: '', spO2: '', temperature: '' },
    notes: '',
    consultationDate: '',
    reason: '' // ✅ حقل جديد لسبب التصنيف
  });
  
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  // جلب قائمة المرضى
  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsRes = await fetch('http://localhost:5000/patients');
        if (patientsRes.ok) setPatients(await patientsRes.json());
      } catch (err) {
        console.error('❌ Failed to fetch patients:', err);
        setStatus(p => ({ ...p, error: 'فشل في تحميل بيانات المرضى' }));
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ معالجة خاصة لحقول العلامات الحيوية
  const handleVitalChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: { ...prev.vitalSigns, [field]: value }
    }));
  };

  const getFullName = (person) => {
    if (!person) return "";
    return `${person.firstName || ''} ${person.lastName || person.familyName || ''}`.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      if (!doctorId || !formData.patientId || !formData.notes.trim()) 
        throw new Error('يرجى إكمال جميع الحقول الإلزامية');
      
      if (formData.type === 'Scheduled' && !formData.consultationDate) 
        throw new Error('يرجى تحديد تاريخ الاستشارة');

      // تصفية العلامات الحيوية الفارغة
      const cleanVitals = Object.fromEntries(
        Object.entries(formData.vitalSigns).filter(([_, v]) => v !== '')
      );

      // ✅ بناء payload مع تضمين userId و userModel للتدقيق
      const payload = {
        patientId: formData.patientId,
        doctorId: doctorId,
        type: formData.type,
        triageLevel: formData.triageLevel,
        vitalSigns: Object.keys(cleanVitals).length > 0 ? {
          ...cleanVitals,
          enteredBy: 'DOCTOR'
        } : undefined,
        triageSource: Object.keys(cleanVitals).length > 0 ? 'CLINICAL_MEASUREMENT' : 'SELF_REPORTED',
        notes: formData.notes.trim(),
        consultationDate: formData.type === 'Instant' 
          ? new Date().toISOString() 
          : new Date(formData.consultationDate).toISOString(),
        // ✅ حقول التدقيق المطلوبة من الـ Backend
        userId: doctorId,
        userModel: 'Doctor',
        reason: formData.reason || 'تصنيف أولي عند إنشاء الاستشارة'
      };

      const res = await fetch('http://localhost:5000/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل في إضافة الاستشارة');

      setStatus({ loading: false, success: true, error: '' });
      setFormData(prev => ({
        ...prev,
        patientId: '',
        triageLevel: 'LEVEL_3',
        vitalSigns: { systolicBP: '', heartRate: '', spO2: '', temperature: '' },
        notes: '',
        consultationDate: '',
        reason: ''
      }));

      setTimeout(() => {
        setStatus(p => ({ ...p, success: false }));
        if (onNavigate) onNavigate('doctorHome');
      }, 1500);

    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div className="doctor-consult-container">
      <div className="consult-card">
        <div className="card-header doctor-theme">
          <h2>👨‍⚕️ تسجيل استشارة جديدة</h2>
          <p>أنت مسجل كطبيب مسؤول لهذه الاستشارة</p>
        </div>
        
        {status.success && <div className="alert success">✅ تمت إضافة الاستشارة بنجاح</div>}
        {status.error && <div className="alert error">❌ {status.error}</div>}

        <form onSubmit={handleSubmit} className="consult-form">
          
          {/* 🔹 المريض */}
          <div className="form-group">
            <label>المريض *</label>
            <select name="patientId" value={formData.patientId} onChange={handleChange} required>
              <option value="">-- اختر المريض --</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {getFullName(p)} ({p.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 نوع الاستشارة */}
          <div className="form-group">
            <label>نوع الاستشارة *</label>
            <div className="radio-group">
              <label className={`radio-label ${formData.type === 'Instant' ? 'active' : ''}`}>
                <input type="radio" name="type" value="Instant" checked={formData.type === 'Instant'} onChange={handleChange} />
                 فورية
              </label>
              <label className={`radio-label ${formData.type === 'Scheduled' ? 'active' : ''}`}>
                <input type="radio" name="type" value="Scheduled" checked={formData.type === 'Scheduled'} onChange={handleChange} />
                📅 مجدولة
              </label>
            </div>
          </div>

          {/* ✅ قسم التصنيف والعلامات الحيوية الجديد */}
          <div className="triage-section">
            <label>مستوى الخطورة (التريج) *</label>
            <div className="triage-buttons">
              {TRIAGE_LEVELS.map(level => (
                <button
                  key={level.code}
                  type="button"
                  className={`triage-btn ${formData.triageLevel === level.code ? 'selected' : ''}`}
                  style={{ borderColor: level.color }}
                  onClick={() => setFormData(prev => ({ ...prev, triageLevel: level.code }))}
                >
                  {level.label}
                </button>
              ))}
            </div>

            {/* ✅ حقل سبب التصنيف (ضروري للتدقيق) */}
            <div className="form-group full-width">
              <label>سبب التصنيف / الملاحظة السريرية *</label>
              <textarea 
                name="reason" 
                value={formData.reason} 
                onChange={handleChange} 
                rows="2" 
                required 
                placeholder="مثال: ضغط دم منخفض جداً، تشوش ذهني، ألم صدري حاد..." 
              />
            </div>

            {/* حقول العلامات الحيوية الاختيارية */}
            <div className="vitals-mini-grid">
              <input 
                type="number" placeholder="ضغط الدم" 
                value={formData.vitalSigns.systolicBP}
                onChange={e => handleVitalChange('systolicBP', e.target.value)}
              />
              <input 
                type="number" placeholder="النبض" 
                value={formData.vitalSigns.heartRate}
                onChange={e => handleVitalChange('heartRate', e.target.value)}
              />
              <input 
                type="number" placeholder="التشبع %" 
                value={formData.vitalSigns.spO2}
                onChange={e => handleVitalChange('spO2', e.target.value)}
              />
              <input 
                type="number" step="0.1" placeholder="الحرارة" 
                value={formData.vitalSigns.temperature}
                onChange={e => handleVitalChange('temperature', e.target.value)}
              />
            </div>
          </div>

          {/* 🔹 التاريخ (للحالات المجدولة فقط) */}
          {formData.type === 'Scheduled' && (
            <div className="form-group animate-fade">
              <label>تاريخ ووقت الاستشارة *</label>
              <input type="datetime-local" name="consultationDate" value={formData.consultationDate} onChange={handleChange} required min={new Date().toISOString().slice(0,16)} />
            </div>
          )}

          {/* 🔹 الملاحظات التفصيلية */}
          <div className="form-group full-width">
            <label>ملاحظات وتشخيص أولي *</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="5" required placeholder="اكتب هنا تفاصيل الحالة والتشخيص..." />
          </div>

          {/* 🔘 الأزرار */}
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={status.loading}>
              {status.loading ? ' جاري الحفظ...' : '💾 حفظ الاستشارة'}
            </button>
            <button type="button" className="btn-cancel" onClick={() => onNavigate?.('doctorHome')}>
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}