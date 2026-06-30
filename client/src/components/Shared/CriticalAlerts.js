import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CriticalAlerts.css';

export default function CriticalAlerts({ userRole }) {
  const [alert, setAlert] = useState(null);
  // ✅ استخدام useRef للصوت باش ما يتعادش تحميله مع كل ريندر
  const audioRef = useRef(new Audio('/sounds/emergency-alert.mp3')); 
  
  // ✅ منع التكرار: نتأكدو أننا ما شغلناش الصوت لنفس الاستشارة مرتين
  const lastAlertIdRef = useRef(null);

  useEffect(() => {
    // الأطباء والممرضين فقط هم من يحتاجون هذا التنبيه الفوري
    if (userRole !== 'doctor' && userRole !== 'nurse') return;

    const checkInterval = setInterval(async () => {
      try {
        // جلب الاستشارات المعلقة فقط
        const res = await axios.get('http://localhost:5000/consultations?status=Pending');
        const allConsults = res.data.data || [];
        
        // تصفية الحالات الحرجة (LEVEL_1 و LEVEL_2)
        const criticalCases = allConsults.filter(c => 
          ['LEVEL_1', 'LEVEL_2'].includes(c.triageLevel)
        );
        
        if (criticalCases.length > 0) {
          // نأخذ أحدث حالة حرجة
          const latestCase = criticalCases[0];
          
          // ✅ شرط مهم: لا تشغل التنبيه إذا كان هو نفس التنبيه السابق
          if (lastAlertIdRef.current !== latestCase._id) {
            setAlert({
              id: latestCase._id,
              patient: `${latestCase.patientId?.firstName || ''} ${latestCase.patientId?.familyName || ''}`,
              level: latestCase.triageLevel,
              time: new Date(latestCase.createdAt).toLocaleTimeString('ar-MA'),
              vitals: latestCase.vitalSigns
            });
            
            lastAlertIdRef.current = latestCase._id;
            
            // تشغيل الصوت (مع معالجة أخطاء المتصفح)
            audioRef.current.play().catch(e => console.warn('⚠️ Audio play blocked by browser policy:', e));
          }
        }
      } catch (err) {
        console.error('❌ Alert check failed:', err);
      }
    }, 15000); // التحقق كل 15 ثانية (أقل ضغطاً على السيرفر)

    return () => clearInterval(checkInterval);
  }, [userRole]);

  const handleDismiss = () => {
    setAlert(null);
    // عند الإخفاء، يمكن إعادة تعيين الـ ID إذا أردت أن يظهر تنبيه جديد لنفس المريض لاحقاً
    // lastAlertIdRef.current = null; 
  };

  if (!alert) return null;

  return (
    <div className="critical-alert-overlay">
      <div className="alert-box pulse-animation">
        <div className="alert-header">
          <div className="alert-icon">🚨</div>
          <h3>تنبيه طوارئ حرج!</h3>
        </div>
        
        <div className="alert-content">
          <p className="patient-name">المريض: <strong>{alert.patient}</strong></p>
          
          <span className={`level-badge ${alert.level}`}>
            {alert.level === 'LEVEL_1' ? '🔴 إنعاش فوري' : '🟠 حالة طارئة'}
          </span>

          {/* عرض سريع للعلامات الحيوية الخطرة */}
          {alert.vitals?.systolicBP && (
            <div className="mini-vitals-alert">
              <span>ضغط: {alert.vitals.systolicBP}</span>
              <span>نبض: {alert.vitals.heartRate}</span>
            </div>
          )}
          
          <small className="alert-time">تم التسجيل: {alert.time}</small>
        </div>

        <div className="alert-actions">
          <button onClick={handleDismiss} className="btn-dismiss">
             ✅ فهمت، جاري التعامل
          </button>
        </div>
      </div>
    </div>
  );
}