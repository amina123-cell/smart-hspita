import React, { useState, useEffect } from 'react';
import './AddConsultationPatient.css';

export default function AddConsultationPatient({ patientId, onNavigate }) {
  // ✅ States
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  
  const [formData, setFormData] = useState({
    doctorId: '',
    type: 'Scheduled', // الافتراضي مجدولة للمريض ليعطي فرصة للاختيار
    priority: 2,
    notes: '',
    consultationDate: ''
  });
  
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  // ✅ جلب قائمة الأطباء عند التحميل
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('http://localhost:5000/doctors');
        if (res.ok) {
          setDoctors(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // ✅ معالجة تغيير المدخلات
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ معالجة الإرسال
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      // التحقق من البيانات
      if (!formData.doctorId) throw new Error('يرجى اختيار طبيب');
      if (!formData.notes.trim()) throw new Error('يرجى وصف الأعراض');
      if (formData.type === 'Scheduled' && !formData.consultationDate) {
        throw new Error('يرجى تحديد موعد للاستشارة المجدولة');
      }

      // إعداد التاريخ
      const finalDate = formData.type === 'Instant' 
        ? new Date().toISOString() 
        : new Date(formData.consultationDate).toISOString();

      const payload = {
        patientId, // ✅ نستخدم الـ ID الممرر من الـ Props مباشرة
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
      if (!res.ok) throw new Error(data.message || 'فشل في حجز الاستشارة');

      setStatus({ loading: false, success: true, error: '' });
      
      // إعادة تعيين النموذج والعودة بعد ثانيتين
      setTimeout(() => {
        setStatus(p => ({ ...p, success: false }));
        if (onNavigate) onNavigate('patientHome');
      }, 2000);

    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div className="patient-consult-container">
      <div className="consult-card">
        <div className="card-header">
          <h2>📅 طلب استشارة طبية جديدة</h2>
          <p>اختر الطبيب المناسب واشرح حالتك الصحية</p>
        </div>

        {status.success && (
          <div className="alert success">
            ✅ تم إرسال طلب الاستشارة بنجاح! سيتم توجيهك للرئيسية...
          </div>
        )}
        
        {status.error && (
          <div className="alert error">❌ {status.error}</div>
        )}

        <form onSubmit={handleSubmit} className="consult-form">
          
          {/* 🔹 اختيار الطبيب */}
          <div className="form-group">
            <label>الطبيب المختص *</label>
            {loadingDoctors ? (
              <div className="loading-text">جاري تحميل الأطباء...</div>
            ) : (
              <select 
                name="doctorId" 
                value={formData.doctorId} 
                onChange={handleChange} 
                required
              >
                <option value="">-- اختر طبيباً --</option>
                {doctors.map(doc => (
                  <option key={doc._id} value={doc._id}>
                    د. {doc.firstName} {doc.familyName} - {doc.department || 'عام'}
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
                <input 
                  type="radio" 
                  name="type" 
                  value="Instant" 
                  checked={formData.type === 'Instant'} 
                  onChange={handleChange} 
                />
                ⚡ فورية (عاجلة)
              </label>
              <label className={`radio-label ${formData.type === 'Scheduled' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="Scheduled" 
                  checked={formData.type === 'Scheduled'} 
                  onChange={handleChange} 
                />
                📅 مجدولة (موعد مسبق)
              </label>
            </div>
          </div>

          {/* 🔹 التاريخ والوقت (يظهر فقط إذا كانت مجدولة) */}
          {formData.type === 'Scheduled' && (
            <div className="form-group animate-fade">
              <label>تاريخ ووقت الموعد المفضل *</label>
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

          {/* 🔹 وصف الحالة */}
          <div className="form-group">
            <label>وصف الأعراض والحالة *</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              rows="5" 
              required 
              placeholder="اكتب هنا تفاصيل ما تشعر به، متى بدأت الأعراض، وأي معلومات أخرى تساعد الطبيب..." 
            />
          </div>

          {/* 🔘 الأزرار */}
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={status.loading}>
              {status.loading ? '⏳ جاري الإرسال...' : '🚀 تأكيد الطلب'}
            </button>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => onNavigate?.('patientHome')}
            >
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}