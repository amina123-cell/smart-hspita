import { useState } from 'react';
import './AddPatientForm.css';

export default function AddPatientForm() {
  const [formData, setFormData] = useState({
    password: '',
    firstName: '',
    familyName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    hasSocialSecurityCard: false,
    socialSecurityNumber: '',
    insuranceType: '',
    insuranceStatus: '',
    coveragePercentage: '',
    bloodGroup: '',
    chronicDiseases: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      const payload = {
        ...formData,
        chronicDiseases: formData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean),
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        coveragePercentage: formData.coveragePercentage ? Number(formData.coveragePercentage) : undefined
      };

      // ✅ التصحيح هنا: تغيير الرابط ليتوافق مع server.js (رابط مباشر ونظيف)
      const response = await fetch('http://localhost:5000/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Failed to add patient');

      setStatus({ loading: false, success: true, error: '' });
      
      // Reset form
      setFormData({
        password: '', firstName: '', familyName: '', dateOfBirth: '', gender: '',
        phoneNumber: '', address: '', hasSocialSecurityCard: false,
        socialSecurityNumber: '', insuranceType: '', insuranceStatus: '',
        coveragePercentage: '', bloodGroup: '', chronicDiseases: '',
        allergies: '', emergencyContactName: '', emergencyContactPhone: ''
      });

      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);

    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div className="add-patient-container">
      
      {/* ✅ Success Toast */}
      {status.success && (
        <div className="success-toast">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <h4>تمت الإضافة بنجاح!</h4>
            <p>تم تسجيل بيانات المريض في النظام</p>
          </div>
          <button className="success-close" onClick={() => setStatus(prev => ({ ...prev, success: false }))}>×</button>
        </div>
      )}

      {/* ❌ Error Toast */}
      {status.error && (
        <div className="error-toast">
          <strong>خطأ:</strong> {status.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="patient-form">
        <h2>📋 إضافة مريض جديد</h2>

        {/* 👤 Basic Info */}
        <fieldset>
          <legend>👤 المعلومات الشخصية</legend>
          <div className="form-grid">
            <Input label="الرقم السري" type="password" name="password" value={formData.password} onChange={handleChange} required />
            <Input label="الاسم الأول *" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <Input label="اسم العائلة *" name="familyName" value={formData.familyName} onChange={handleChange} required />
            <Input label="تاريخ الميلاد" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
            
            {/* ✅ Select مع قيم إنجليزية للباك إند */}
            <Select 
              label="الجنس" 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              options={[
                { value: '', label: 'اختر...' },
                { value: 'male', label: 'ذكر' },
                { value: 'female', label: 'أنثى' }
              ]} 
            />
            
            <Input label="رقم الهاتف" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} required />
            <Input label="العنوان" name="address" value={formData.address} onChange={handleChange} />
          </div>
        </fieldset>

        {/* 🛡️ Insurance */}
        <fieldset>
          <legend>🛡️ معلومات الضمان الاجتماعي</legend>
          <div className="form-grid">
            <Checkbox label="يملك بطاقة ضمان" name="hasSocialSecurityCard" checked={formData.hasSocialSecurityCard} onChange={handleChange} />
            <Input label="رقم الضمان الاجتماعي" name="socialSecurityNumber" value={formData.socialSecurityNumber} onChange={handleChange} disabled={!formData.hasSocialSecurityCard} />
            
            <Select 
              label="نوع التأمين" 
              name="insuranceType" 
              value={formData.insuranceType} 
              onChange={handleChange} 
              options={[
                { value: '', label: 'اختر...' },
                { value: 'CNAS', label: 'CNAS' },
                { value: 'CASNOS', label: 'CASNOS' },
                { value: 'other', label: 'أخرى' }
              ]} 
            />
            
            <Select 
              label="حالة التأمين" 
              name="insuranceStatus" 
              value={formData.insuranceStatus} 
              onChange={handleChange} 
              options={[
                { value: '', label: 'اختر...' },
                { value: 'active', label: 'نشط' },
                { value: 'expired', label: 'منتهي' }
              ]} 
            />
            
            <Input label="نسبة التغطية (%)" name="coveragePercentage" type="number" min="0" max="100" value={formData.coveragePercentage} onChange={handleChange} />
          </div>
        </fieldset>

        {/* 🏥 Medical Info */}
        <fieldset>
          <legend>🏥 المعلومات الطبية</legend>
          <div className="form-grid">
            <Select 
              label="فصيلة الدم" 
              name="bloodGroup" 
              value={formData.bloodGroup} 
              onChange={handleChange} 
              options={[
                { value: '', label: 'اختر...' },
                { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }
              ]} 
            />
            <Input label="أمراض مزمنة (افصل بفاصلة)" name="chronicDiseases" value={formData.chronicDiseases} onChange={handleChange} placeholder="سكري، ضغط..." />
            <Input label="حساسيات (افصل بفاصلة)" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="بنسلين، مكسرات..." />
          </div>
        </fieldset>

        {/* 🚨 Emergency */}
        <fieldset>
          <legend>🚨 جهة اتصال الطوارئ</legend>
          <div className="form-grid">
            <Input label="اسم جهة الاتصال" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} />
            <Input label="رقم هاتف الطوارئ" name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} />
          </div>
        </fieldset>

        <button type="submit" className="submit-btn" disabled={status.loading}>
          {status.loading ? '⏳ جاري الحفظ...' : '💾 حفظ المريض'}
        </button>
      </form>
    </div>
  );
}

/* 🔹 Input Component */
function Input({ label, name, type = 'text', value, onChange, required, disabled, placeholder }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}

/* 🔹 Select Component - ✅ مصحح ليدعم objects */
function Select({ label, name, value, onChange, options }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <select name={name} value={value} onChange={onChange}>
        {options.map((opt, i) => {
          // ✅ دعم كلاً من: ['a', 'b'] أو [{value: 'a', label: 'A'}]
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={i} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}

/* 🔹 Checkbox Component */
function Checkbox({ label, name, checked, onChange }) {
  return (
    <div className="form-field checkbox-field">
      <label>
        <input type="checkbox" name={name} checked={checked} onChange={onChange} />
        {label}
      </label>
    </div>
  );
}