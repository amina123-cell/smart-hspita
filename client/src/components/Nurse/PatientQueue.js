import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TriageForm from './TriageForm'; // ✅ استيراد الفورم من الخطوة السابقة
import './PatientQueue.css';

// ✅ خريطة الأولويات للفرز السريع
const PRIORITY_MAP = { 
  'LEVEL_1': 1, 'LEVEL_2': 2, 'LEVEL_3': 3, 'LEVEL_4': 4, 'LEVEL_5': 5 
};

// ✅ ألوان ومستويات التريج للعرض البصري
const TRIAGE_STYLES = {
  LEVEL_1: { bg: '#ef4444', label: 'إنعاش', icon: '🚨' },
  LEVEL_2: { bg: '#f97316', label: 'طارئ', icon: '⚡' },
  LEVEL_3: { bg: '#eab308', label: 'عاجل', icon: '' },
  LEVEL_4: { bg: '#3b82f6', label: 'أقل إلحاحاً', icon: '📋' },
  LEVEL_5: { bg: '#22c55e', label: 'غير عاجل', icon: '✅' }
};

export default function PatientQueue({ nurseId }) {
  const [queue, setQueue] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ جلب وترتيب المرضى عند التحميل
  const fetchAndSortQueue = async () => {
    try {
      const res = await axios.get('http://localhost:5000/consultations?status=Pending');
      const consultations = res.data.data || res.data;

      // ✅ الفرز الذكي: الأولوية أولاً، ثم وقت الوصول
      const sorted = [...consultations].sort((a, b) => {
        const pA = PRIORITY_MAP[a.triageLevel] || 3;
        const pB = PRIORITY_MAP[b.triageLevel] || 3;
        if (pA !== pB) return pA - pB;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      setQueue(sorted);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSortQueue();
    // تحديث تلقائي كل دقيقة للحالات الجديدة
    const interval = setInterval(fetchAndSortQueue, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTriageSuccess = () => {
    setSelectedConsultation(null);
    fetchAndSortQueue(); // ✅ إعادة الفرز بعد التحديث
  };

  if (loading) return <div className="loading"> جاري تحميل قائمة الانتظار...</div>;

  return (
    <div className="patient-queue-container">
      <h2> قائمة انتظار المرضى</h2>
      
      {/* عرض القائمة المرتبة */}
      <div className="queue-list">
        {queue.length === 0 ? (
          <div className="empty-state">لا يوجد مرضى في الانتظار حالياً</div>
        ) : (
          queue.map(patient => {
            const style = TRIAGE_STYLES[patient.triageLevel] || TRIAGE_STYLES.LEVEL_3;
            const isClinical = patient.triageSource === 'CLINICAL_MEASUREMENT';
            
            return (
              <div key={patient._id} className={`queue-card ${patient.triageLevel}`}>
                {/* شريط اللون الجانبي حسب الخطورة */}
                <div className="priority-strip" style={{ backgroundColor: style.bg }}></div>
                
                <div className="card-content">
                  <div className="patient-header">
                    <span className="triage-badge" style={{ backgroundColor: style.bg }}>
                      {style.icon} {style.label}
                    </span>
                    
                    {/* تحذير إذا كانت البيانات ذاتية فقط */}
                    {!isClinical && (
                      <span className="self-reported-warning">
                        ⚠️ تقرير ذاتي
                      </span>
                    )}
                  </div>

                  <h3>{patient.patientId?.firstName} {patient.patientId?.familyName}</h3>
                  
                  {/* عرض العلامات الحيوية إن وجدت */}
                  {patient.vitalSigns?.systolicBP && (
                    <div className="vitals-summary">
                      <span>🫀 {patient.vitalSigns.systolicBP}/{patient.vitalSigns.diastolicBP || '-'}</span>
                      <span>❤️ {patient.vitalSigns.heartRate}</span>
                      <span>️ {patient.vitalSigns.temperature}°C</span>
                    </div>
                  )}

                  <small className="wait-time">
                    منذ {Math.floor((Date.now() - new Date(patient.createdAt)) / 60000)} دقيقة
                  </small>
                </div>

                {/* زر التصنيف أو التعديل */}
                <button 
                  className="btn-triage"
                  onClick={() => setSelectedConsultation(patient)}
                >
                  {isClinical ? '✏️ تعديل' : '🩺 تصنيف'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* نافذة التصنيف المنبثقة */}
      {selectedConsultation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedConsultation(null)}></button>
            <TriageForm 
              consultationId={selectedConsultation._id}
              nurseId={nurseId}
              onSuccess={handleTriageSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}