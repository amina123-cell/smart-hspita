import React, { useState } from 'react';
import { getVitalStatus, calculateAutoTriage } from '../../utils/vitalSignsLogic';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function SmartPatientIntake({ nurseId, onSuccess }) {
  const [patientInfo, setPatientInfo] = useState({ firstName: '', familyName: '', phoneNumber: '' });
  const [vitals, setVitals] = useState({ systolicBP: '', heartRate: '', spO2: '', temperature: '' });
  const [autoResult, setAutoResult] = useState(null);

  // ✅ تحديث العلامات الحيوية وحساب الخطورة تلقائياً
  const handleVitalChange = (field, value) => {
    const newVitals = { ...vitals, [field]: value };
    setVitals(newVitals);
    
    // الحساب التلقائي يحدث مع كل رقم يكتبه الممرض
    const result = calculateAutoTriage(newVitals);
    setAutoResult(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. تسجيل المريض أولاً
      const patRes = await axios.post('http://localhost:5000/patients', patientInfo);
      const newPatientId = patRes.data._id || patRes.data.patientId;

      // 2. إنشاء استشارة مبدئية مع التصنيف التلقائي
      await axios.post('http://localhost:5000/consultations', {
        patientId: newPatientId,
        nurseId: nurseId,
        type: 'Instant',
        notes: 'تسجيل أولي من طرف الممرض',
        triageLevel: autoResult?.level || 'LEVEL_3',
        vitalSigns: vitals,
        triageSource: 'CLINICAL_MEASUREMENT',
        userId: nurseId,
        userModel: 'Nurse',
        reason: `تصنيف تلقائي بناءً على العلامات الحيوية: ${autoResult?.text}`
      });

      toast.success('✅ تم تسجيل المريض وتصنيف حالته بنجاح');
      onSuccess?.();
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء التسجيل');
    }
  };

  const fields = [
    { key: 'systolicBP', label: 'ضغط الدم', unit: 'mmHg', placeholder: '120' },
    { key: 'heartRate', label: 'النبض', unit: 'BPM', placeholder: '72' },
    { key: 'spO2', label: 'التشبع', unit: '%', placeholder: '98' },
    { key: 'temperature', label: 'الحرارة', unit: '°C', placeholder: '36.6' }
  ];

  return (
    <form onSubmit={handleSubmit} className="smart-intake-form">
      <h3>🩺 تسجيل مريض جديد وتقييم الحالة</h3>
      
      {/* معلومات المريض الأساسية */}
      <div className="patient-info-grid">
        <input placeholder="الاسم الأول" required onChange={e => setPatientInfo({...patientInfo, firstName: e.target.value})} />
        <input placeholder="اسم العائلة" required onChange={e => setPatientInfo({...patientInfo, familyName: e.target.value})} />
        <input placeholder="رقم الهاتف" type="tel" required onChange={e => setPatientInfo({...patientInfo, phoneNumber: e.target.value})} />
      </div>

      {/* شبكة العلامات الحيوية الذكية */}
      <div className="vitals-grid">
        {fields.map(field => {
          const status = getVitalStatus(field.key, vitals[field.key]);
          return (
            <div key={field.key} className="vital-input-wrapper" style={{ borderColor: status.color }}>
              <label>{field.label}</label>
              <input 
                type="number" 
                placeholder={field.placeholder}
                value={vitals[field.key]}
                onChange={e => handleVitalChange(field.key, e.target.value)}
                style={{ color: status.color }}
              />
              <small style={{ color: status.color }}>{status.label}</small>
            </div>
          );
        })}
      </div>

      {/* شريط النتيجة التلقائية البارز */}
      {autoResult && (
        <div className="auto-triage-banner" style={{ 
          backgroundColor: `${autoResult.color}15`, 
          borderRight: `5px solid ${autoResult.color}`,
          color: autoResult.color 
        }}>
          <strong>النتيجة التلقائية:</strong> {autoResult.text}
        </div>
      )}

      <button type="submit" className="btn-primary">💾 حفظ وتسجيل في قائمة الانتظار</button>
    </form>
  );
}