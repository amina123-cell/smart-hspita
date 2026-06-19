import React, { useState, useEffect } from 'react';
import './AddConsultationDoctor.css';

export default function AddConsultationDoctor({ doctorId, onNavigate }) {
  // ✅ States للقوائم
  const [patients, setPatients] = useState([]);
  
  // ✅ حالة النموذج
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'Instant',
    priority: 2,
    notes: '',
    consultationDate: ''
  });
  
  // ✅ حالة الواجهة
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  // ✅ جلب قائمة المرضى
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
      if (!doctorId || doctorId.length !== 24) throw new Error('معرف الطبيب غير صحيح');
      if (!formData.patientId || formData.patientId.length !== 24) throw new Error('يرجى اختيار مريض');
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
        doctorId: doctorId, // ✅ يتم استخدام معرف الطبيب المسجل دخولاً تلقائياً
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
        notes: '',
        consultationDate: '',
        priority: 2
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