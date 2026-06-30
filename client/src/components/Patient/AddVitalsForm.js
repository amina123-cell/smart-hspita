import React, { useState } from 'react';
import { getVitalStatus } from '../../utils/vitalSignsLogic';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AddVitalsForm({ patientId, onSuccess }) {
  const [vitals, setVitals] = useState({ systolicBP: '', heartRate: '', spO2: '', temperature: '' });

  const handleChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // إرسال العلامات الحيوية لتحديث آخر استشارة أو إنشاء سجل جديد
      await axios.put(`http://localhost:5000/patients/${patientId}/vitals`, {
        vitalSigns: vitals,
        enteredBy: 'PATIENT_SELF_REPORT'
      });
      
      toast.success("✅ تم تحديث علامتك الحيوية بنجاح");
      onSuccess?.();
    } catch (err) {
      toast.error("فشل في حفظ البيانات");
    }
  };

  const fields = [
    { key: 'systolicBP', label: 'ضغط الدم', unit: 'mmHg', placeholder: '120' },
    { key: 'heartRate', label: 'النبض', unit: 'BPM', placeholder: '72' },
    { key: 'spO2', label: 'التشبع', unit: '%', placeholder: '98' },
    { key: 'temperature', label: 'الحرارة', unit: '°C', placeholder: '36.6' }
  ];

  return (
    <form onSubmit={handleSubmit} className="patient-vitals-form">
      <h3>🩺 أدخل علاماتك الحيوية الحالية</h3>
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
                onChange={e => handleChange(field.key, e.target.value)}
                style={{ color: status.color }}
              />
              <small style={{ color: status.color }}>{status.label !== '-' ? status.label : ''}</small>
            </div>
          );
        })}
      </div>
      <button type="submit" className="btn-primary">💾 حفظ ومتابعة</button>
    </form>
  );
}