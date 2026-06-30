import React, { useState, useEffect } from 'react';

// ✅ جرب هاد المسار أولاً. إذا ما خدمش، شوف الجدول الفوق وبدله
import { getVitalStatus } from '../../utils/vitalSignsLogic'; 

// ✅ تأكد أن هذا الملف موجود جنب ملف JS
import './SmartVitalsSection.css'; 

export default function SmartVitalsSection({ initialVitals, userRole, consultationId, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [vitals, setVitals] = useState(initialVitals || {});

  useEffect(() => {
    if (initialVitals) {
      setVitals(initialVitals);
    }
  }, [initialVitals]);

  const handleChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(vitals);
    }
    setIsEditing(false);
  };

  const fields = [
    { key: 'systolicBP', label: 'ضغط الدم', unit: 'mmHg', placeholder: '120' },
    { key: 'heartRate', label: 'النبض', unit: 'BPM', placeholder: '72' },
    { key: 'spO2', label: 'التشبع', unit: '%', placeholder: '98' },
    { key: 'temperature', label: 'الحرارة', unit: '°C', placeholder: '36.6' }
  ];

  if (isEditing) {
    return (
      <div className="vitals-edit-card">
        <div className="card-header">
          <h4>✏️ تحديث القياسات السريرية</h4>
          <button className="btn-cancel" onClick={() => setIsEditing(false)}>إلغاء</button>
        </div>
        
        <div className="vitals-grid-edit">
          {fields.map(field => {
            // ✅ هنا فين كيتصل بالمنطق ديال الألوان
            const status = getVitalStatus(field.key, vitals[field.key]);
            return (
              <div key={field.key} className="input-wrapper" style={{ borderColor: status.color }}>
                <label>{field.label}</label>
                <input 
                  type="number" 
                  placeholder={field.placeholder}
                  value={vitals[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  style={{ color: status.color }}
                />
                <small style={{ color: status.color }}>{status.label !== '-' ? status.label : ''}</small>
              </div>
            );
          })}
        </div>
        
        <button className="btn-save" onClick={handleSave}>💾 حفظ التحديث</button>
      </div>
    );
  }

  return (
    <div className="vitals-display-card">
      <div className="card-header">
        <h4>🩺 العلامات الحيوية المسجلة</h4>
        {(userRole === 'doctor' || userRole === 'nurse') && (
          <button className="btn-edit" onClick={() => setIsEditing(true)}>تحديث القياسات</button>
        )}
      </div>

      <div className="vitals-grid-display">
        {fields.map(field => {
          const value = vitals[field.key];
          if (!value) return null;
          
          const status = getVitalStatus(field.key, value);
          
          return (
            <div key={field.key} className="vital-box" style={{ borderColor: status.color }}>
              <span className="vital-label">{field.label}</span>
              <strong className="vital-value" style={{ color: status.color }}>
                {value} <small>{field.unit}</small>
              </strong>
              <span className="vital-status-text">{status.label}</span>
            </div>
          );
        })}
        
        {Object.keys(vitals).length === 0 && (
          <p className="no-data-msg">⚠️ لم يتم تسجيل علامات حيوية بعد</p>
        )}
      </div>
      
      {vitals.enteredBy && (
        <small className="entered-by-info">تم القياس بواسطة: {vitals.enteredBy}</small>
      )}
    </div>
  );
}