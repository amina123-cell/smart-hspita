import React, { useState, useEffect } from 'react';
import './AddConsultationAdmin.css';

export default function AddConsultationAdmin({ onNavigate }) {
  // ✅ States للقوائم
  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  // ✅ حالة النموذج
  const [formData, setFormData] = useState({
    patientId: '',
    nurseId: '',
    doctorId: '',
    type: 'Instant',
    priority: 2,
    notes: '',
    consultationDate: ''
  });
  
  // ✅ حالة الواجهة
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  // ✅ جلب القوائم المنسدلة
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, nursesRes, doctorsRes] = await Promise.all([
          fetch('http://localhost:5000/patients'),
          fetch('http://localhost:5000/nurses'),
          fetch('http://localhost:5000/doctors')
        ]);
        
        if (patientsRes.ok) setPatients(await patientsRes.json());
        if (nursesRes.ok) setNurses(await nursesRes.json());
        if (doctorsRes.ok) setDoctors(await doctorsRes.json());
      } catch (err) {
        console.error('❌ Failed to fetch dropdown data:', err);
        setStatus(p => ({ ...p, error: 'فشل في تحميل البيانات' }));
      }
    };
    fetchData();
  }, []);

  // ✅ تحديث formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ دالة مساعدة لعرض الاسم الكامل
  const getFullName = (person) => {
    if (!person) return "";
    const first = person.firstName || '';
    const last = person.lastName || person.familyName || ''; 
    return `${first} ${last}`.trim();
  };

  // ✅ معالجة الإرسال
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      // التحقق من البيانات
      if (!formData.doctorId || formData.doctorId.length !== 24) throw new Error('معرف الطبيب غير صحيح');
      if (!formData.patientId || formData.patientId.length !== 24) throw new Error('معرف المريض غير صحيح');
      if (!formData.notes.trim()) throw new Error('يرجى كتابة الملاحظات');
      
      if (formData.type === 'Scheduled' && !formData.consultationDate) {
        throw new Error('يرجى تحديد تاريخ الاستشارة');
      }

      // تحديد التاريخ
      const finalDate = formData.type === 'Instant' 
        ? new Date().toISOString() 
        : new Date(formData.consultationDate).toISOString();

      const payload = {
        patientId: formData.patientId,
        nurseId: formData.nurseId || null,
        doctorId: formData.doctorId,
        type: formData.type,
        priority: Number(formData.priority),
        notes: formData.notes.trim(),
        consultationDate: finalDate
      };

      // إرسال الطلب
      const res = await fetch('http://localhost:5000/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل في إضافة الاستشارة');

      // نجاح العملية
      setStatus({ loading: false, success: true, error: '' });
      setFormData(prev => ({
        ...prev,
        patientId: '',
        nurseId: '',
        notes: '',
        consultationDate: '',
        priority: 2
      }));

      setTimeout(() => {
        setStatus(p => ({ ...p, success: false }));
        if (onNavigate) onNavigate('adminHome');
      }, 1500);

    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div className="admin-consult-container">
      <div className="consult-card">
        <div className="card-header admin-theme">
          <h2>⚙️ إدارة الاستشارات (الأدمن)</h2>
          <p>تسجيل استشارة نيابة عن أي مستخدم</p>
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

          {/* 🔹 الطبيب */}
          <div className="form-group">
            <label>الطبيب المعالج *</label>
            <select name="doctorId" value={formData.doctorId} onChange={handleChange} required>
              <option value="">-- اختر الطبيب --</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  د. {getFullName(d)} - {d.department || 'عام'}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 الممرض (اختياري) */}
          <div className="form-group">
            <label>الممرض المساعد (اختياري)</label>
            <select name="nurseId" value={formData.nurseId} onChange={handleChange}>
              <option value="">-- بدون ممرض --</option>
              {nurses.map(n => (
                <option key={n._id} value={n._id}>
                  {getFullName(n)}
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
              <label>تاريخ ووقت الاستشارة *</label>
              <input type="datetime-local" name="consultationDate" value={formData.consultationDate} onChange={handleChange} required min={new Date().toISOString().slice(0,16)} />
            </div>
          )}

          {/* 🔹 الأولوية */}
          <div className="form-group">
            <label>الأولوية</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value={2}>⚪ عادية</option>
              <option value={1}>🔴 عالية</option>
            </select>
          </div>

          {/* 🔹 الملاحظات */}
          <div className="form-group full-width">
            <label>ملاحظات وتفاصيل الاستشارة *</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="5" required placeholder="اكتب هنا تفاصيل الحالة..." />
          </div>

          {/* 🔘 الأزرار */}
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={status.loading}>
              {status.loading ? ' جاري الحفظ...' : '💾 حفظ الاستشارة'}
            </button>
            <button type="button" className="btn-cancel" onClick={() => onNavigate?.('adminHome')}>
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}