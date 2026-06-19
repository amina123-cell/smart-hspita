import React, { useState, useEffect } from 'react';
import './AddConsultationNurse.css'; // تأكد من اسم الملف

export default function AddConsultationNurse({ nurseId, onNavigate }) {
  // ✅ States للقوائم
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // ✅ حالة النموذج
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    type: 'Scheduled',
    priority: 2,
    notes: '',
    consultationDate: ''
  });
  
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  // ✅ جلب القوائم (المرضى والأطباء)
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

  // ✅ معالجة التغييرات
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ دالة مساعدة للأسماء
  const getFullName = (person) => {
    if (!person) return "";
    return `${person.firstName || ''} ${person.familyName || person.lastName || ''}`.trim();
  };

  // ✅ إرسال النموذج
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

      const payload = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        nurseId: nurseId, // ✅ نستخدم الـ ID الخاص بالممرضة المسجلة دخولها
        type: formData.type,
        priority: Number(formData.priority),
        notes: formData.notes.trim(),
        consultationDate: finalDate
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

  return (
    <div className="nurse-consult-container">
      <div className="consult-card">
        <div className="card-header nurse-theme">
          <h2>👩‍⚕️ تسجيل استشارة جديدة</h2>
          <p>قم بتوجيه المريض للطبيب المختص</p>
        </div>

        {status.success && (
          <div className="alert success">✅ تم تسجيل الاستشارة بنجاح! جاري التوجيه...</div>
        )}
        {status.error && <div className="alert error">❌ {status.error}</div>}

        <form onSubmit={handleSubmit} className="consult-form">
          
          {/* 🔹 اختيار المريض */}
          <div className="form-group">
            <label>المريض *</label>
            {loadingData ? (
              <div className="loading-text">جاري التحميل...</div>
            ) : (
              <select name="patientId" value={formData.patientId} onChange={handleChange} required>
                <option value="">-- اختر المريض --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {getFullName(p)} - {p.phoneNumber}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 🔹 اختيار الطبيب */}
          <div className="form-group">
            <label>الطبيب المعالج *</label>
            {loadingData ? (
              <div className="loading-text">جاري التحميل...</div>
            ) : (
              <select name="doctorId" value={formData.doctorId} onChange={handleChange} required>
                <option value="">-- اختر الطبيب --</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    د. {getFullName(d)} - {d.department || 'عام'}
                  </option>
                ))}
              </select>
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

          {/* 🔹 التاريخ */}
          {formData.type === 'Scheduled' && (
            <div className="form-group animate-fade">
              <label>تاريخ ووقت الموعد *</label>
              <input 
                type="datetime-local" 
                name="consultationDate" 
                value={formData.consultationDate} 
                onChange={handleChange} 
                required 
                min={new Date().toISOString().slice(0,16)} 
              />
            </div>
          )}

          {/* 🔹 الملاحظات */}
          <div className="form-group">
            <label>ملاحظات التمريض والأعراض الأولية *</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              rows="4" 
              required 
              placeholder="سجل هنا العلامات الحيوية أو الشكوى الرئيسية للمريض..." 
            />
          </div>

          {/* 🔘 الأزرار */}
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={status.loading}>
              {status.loading ? '⏳ جاري الحفظ...' : '💾 حفظ وتوجيه'}
            </button>
            <button type="button" className="btn-cancel" onClick={() => onNavigate?.('nurseHome')}>
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}