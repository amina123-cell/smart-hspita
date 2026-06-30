import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './TriageForm.css';

// ✅ تعريف مستويات التريج مع الألوان والوصف
const TRIAGE_LEVELS = [
  { code: 'LEVEL_1', label: 'إنعاش', color: '#ef4444', desc: 'خطر داهم على الحياة' },
  { code: 'LEVEL_2', label: 'طارئ', color: '#f97316', desc: 'ألم شديد / تشوش ذهني' },
  { code: 'LEVEL_3', label: 'عاجل', color: '#eab308', desc: 'يحتاج موارد متعددة' },
  { code: 'LEVEL_4', label: 'أقل إلحاحاً', color: '#3b82f6', desc: 'يحتاج مورد واحد' },
  { code: 'LEVEL_5', label: 'غير عاجل', color: '#22c55e', desc: 'مشكلة بسيطة' }
];

export default function TriageForm({ consultationId, nurseId, onSuccess }) {
  const [vitals, setVitals] = useState({});
  const [symptoms, setSymptoms] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('LEVEL_3');
  const [loading, setLoading] = useState(false);

  // ✅ منطق الاقتراح التلقائي بناءً على العلامات الحيوية
  const suggestLevel = () => {
    if ((vitals.systolicBP < 90) || (vitals.spO2 < 90) || (vitals.gcs < 13)) return 'LEVEL_1';
    if ((vitals.heartRate > 120) || (vitals.temperature > 39.5) || (vitals.respiratoryRate > 30)) return 'LEVEL_2';
    return 'LEVEL_3';
  };

  // تحديث المستوى المقترح تلقائياً عند تغيير العلامات الحيوية
  React.useEffect(() => {
    if (Object.keys(vitals).length > 0) {
      const suggested = suggestLevel();
      if (suggested !== selectedLevel && !symptoms.length) {
        setSelectedLevel(suggested);
      }
    }
  }, [vitals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`http://localhost:5000/consultations/${consultationId}/triage`, {
        triageLevel: selectedLevel,
        vitalSigns: vitals,
        selfReportedSymptoms: symptoms,
        enteredBy: 'NURSE' // ✅ تحديد المصدر كقياس سريري
      });

      toast.success('✅ تم حفظ التصنيف بنجاح');
      onSuccess?.(); // تحديث القائمة الأب بعد الحفظ
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="triage-form">
      <h3>🩺 تصنيف الحالة وتسجيل العلامات</h3>

      {/* شبكة إدخال العلامات الحيوية */}
      <div className="vitals-grid">
        <label>ضغط الدم (mmHg)<input type="number" placeholder="120" onChange={e => setVitals({...vitals, systolicBP: Number(e.target.value)})} /></label>
        <label>النبض (BPM)<input type="number" placeholder="72" onChange={e => setVitals({...vitals, heartRate: Number(e.target.value)})} /></label>
        <label>التنفس (/دقيقة)<input type="number" placeholder="16" onChange={e => setVitals({...vitals, respiratoryRate: Number(e.target.value)})} /></label>
        <label>التشبع (%)<input type="number" placeholder="98" onChange={e => setVitals({...vitals, spO2: Number(e.target.value)})} /></label>
        <label>الحرارة (°C)<input type="number" step="0.1" placeholder="36.6" onChange={e => setVitals({...vitals, temperature: Number(e.target.value)})} /></label>
        <label>GCS (الوعي)<input type="number" placeholder="15" onChange={e => setVitals({...vitals, gcs: Number(e.target.value)})} /></label>
      </div>

      {/* عرض المستوى الحالي بشكل بصري واضح */}
      <div className="current-level-display" style={{ backgroundColor: TRIAGE_LEVELS.find(l => l.code === selectedLevel)?.color }}>
        <span>{TRIAGE_LEVELS.find(l => l.code === selectedLevel)?.label}</span>
        <small>{TRIAGE_LEVELS.find(l => l.code === selectedLevel)?.desc}</small>
      </div>

      {/* أزرار التعديل اليدوي السريع */}
      <div className="manual-adjust-buttons">
        <span>تعديل يدوي:</span>
        {TRIAGE_LEVELS.map(level => (
          <button 
            key={level.code} 
            type="button"
            onClick={() => setSelectedLevel(level.code)}
            style={{ 
              borderColor: level.color, 
              backgroundColor: selectedLevel === level.code ? level.color : 'transparent',
              color: selectedLevel === level.code ? '#fff' : level.color
            }}
          >
            {level.label}
          </button>
        ))}
      </div>

      <textarea 
        placeholder="ملاحظات إضافية عن حالة المريض..." 
        rows="3"
        onChange={e => setSymptoms([{ symptom: e.target.value, severity: 5, duration: 'غير محدد' }])}
      />

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? '⏳ جاري الحفظ...' : '✅ تأكيد التصنيف وإدخال القائمة'}
      </button>
    </form>
  );
}