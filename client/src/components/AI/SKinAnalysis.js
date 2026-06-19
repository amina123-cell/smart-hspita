import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './SkinAnalysis.css';

// ✅ قاموس ترجمة الأمراض من الإنجليزية للعربية
const DISEASE_TRANSLATIONS = {
  "Acne and Rosacea Photos": "حب الشباب والوردية",
  "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions": "تقرن شعيني وسرطان الخلايا القاعدية",
  "Atopic Dermatitis Photos": "التهاب الجلد التأتبي (الإكزيما)",
  "Bullous Disease Photos": "أمراض الفقاعات الجلدية",
  "Cellulitis Impetigo and other Bacterial Infections": "التهاب النسيج الخلوي والقوبح (عدوى بكتيرية)",
  "Eczema Photos": "الإكزيما",
  "Exanthems and Drug Eruptions": "الطفح الجلدي والحساسية الدوائية",
  "Hair Loss Photos Alopecia and other Hair Diseases": "تساقط الشعر والثعلبة",
  "Herpes HPV and other STDs Photos": "الهربس وفيروس الورم الحليمي",
  "Light Diseases and Disorders of Pigmentation": "اضطرابات التصبغ الجلدي",
  "Lupus and other Connective Tissue diseases": "الذئبة الحمراء وأمراض النسيج الضام",
  "Melanoma Skin Cancer Nevi and Moles": "الميلانوما (سرطان الجلد) والشامات",
  "Nail Fungus and other Nail Disease": "فطريات الأظافر",
  "Poison Ivy Photos and other Contact Dermatitis": "البلوط السام والتهاب الجلد التماسي",
  "Psoriasis pictures Lichen Planus and related diseases": "الصدفية والحزاز المسطح",
  "Scabies Lyme Disease and other Infestations and Bites": "الجرب وداء لايم واللدغات",
  "Seborrheic Keratoses and other Benign Tumors": "التقرن الدهني والأورام الحميدة",
  "Systemic Disease": "أمراض جهازية تؤثر على الجلد",
  "Tinea Ringworm Candidiasis and other Fungal Infections": "السعفة والقوباء الحلقية (فطريات)",
  "Urticaria Hives": "الأرتيكاريا (الشري)",
  "Vascular Tumors": "أورام وعائية",
  "Vasculitis Photos": "التهاب الأوعية الدموية",
  "Warts Molluscum and other Viral Infections": "الثآليل والعدوى الفيروسية"
};

export default function SkinAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [result, setResult] = useState(null);
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('diagnosisHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('diagnosisHistory', JSON.stringify(history));
  }, [history]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة فقط (JPG, PNG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً! الحد الأقصى 10MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setProgress(0);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.warning('يرجى اختيار صورة أولاً');
      return;
    }

    setLoading(true);
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'فشل في تحليل الصورة');
      }

      setResult(data);
      toast.success('✅ تم التحليل بنجاح');

      // حفظ النتيجة في السجل مع الترجمة
      const diseaseName = data.disease || data.prediction;
      const arabicName = DISEASE_TRANSLATIONS[diseaseName] || diseaseName;

      const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString('ar-MA'),
        prediction: arabicName,
        confidence: data.confidence
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 5));

    } catch (err) {
      clearInterval(progressInterval);
      console.error('Prediction Error:', err);
      toast.error(err.message || 'حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setProgress(0);
  };

  // دالة مساعدة لجلب الاسم المترجم
  const getTranslatedDisease = (englishName) => {
    return DISEASE_TRANSLATIONS[englishName] || englishName;
  };

  return (
    <div className="skin-analysis-container">
      <div className="analysis-card fade-in">
        
        {/* 👑 الرأس */}
        <div className="card-header">
          <div className="header-badge">مدعوم بالذكاء الاصطناعي</div>
          <h2>تشخيص الأمراض الجلدية</h2>
          <p>تحليل فوري ودقيق باستخدام أحدث التقنيات الطبية</p>
        </div>

        <div className="card-body">
          {/* 📸 منطقة الرفع */}
          <div className="upload-section">
            {!previewUrl ? (
              <label className="upload-placeholder pulse-animation">
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                <div className="upload-content">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">اضغط هنا لرفع صورة الإصابة</span>
                  <span className="upload-hint">يدعم الصور بصيغة JPG, PNG (الحد الأقصى 10MB)</span>
                </div>
              </label>
            ) : (
              <div className="preview-wrapper">
                <img src={previewUrl} alt="معاينة" className="preview-image" />
                {!loading && (
                  <button className="remove-btn" onClick={handleReset} title="إزالة الصورة">
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ⏳ شريط التقدم */}
          {loading && (
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              <span className="progress-text">جاري تحليل البيانات البيولوجية... {progress}%</span>
            </div>
          )}

          {/* 🔘 أزرار التحكم */}
          <div className="actions-row">
            <button 
              className={`analyze-btn ${loading ? 'disabled' : ''}`} 
              onClick={handleAnalyze} 
              disabled={loading || !selectedFile}
            >
              {loading ? '⏳ جاري المعالجة...' : '🔍 بدء التشخيص'}
            </button>
          </div>

          {/* 📊 النتيجة */}
          {result && !loading && (
            <div className={`result-box slide-up ${result.confidence > 75 ? 'high-confidence' : 'medium-confidence'}`}>
              <div className="result-header">
                <h3>نتيجة التشخيص الأولي</h3>
                <span className="confidence-badge">{Number(result.confidence).toFixed(1)}% دقة</span>
              </div>
              
              <div className="disease-name">
                {getTranslatedDisease(result.disease || result.prediction)}
              </div>

              <div className="recommendation">
                <strong>💡 التوصية الطبية:</strong>
                <p>ينصح بمراجعة طبيب مختص لتأكيد الحالة والحصول على الخطة العلاجية المناسبة.</p>
              </div>

              <p className="disclaimer">
                ⚠️ تنبيه هام: هذا النظام مساعد للطبيب ولا يغني عن التشخيص السريري المباشر.
              </p>
            </div>
          )}
        </div>

        {/* 📜 السجل */}
        {history.length > 0 && (
          <div className="history-section">
            <h4>🕒 سجل التشخيصات الأخيرة</h4>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="hist-info">
                    <span className="hist-date">{item.date}</span>
                    <span className="hist-result">{item.prediction}</span>
                  </div>
                  <span className={`hist-conf ${item.confidence > 75 ? 'good' : 'avg'}`}>
                    {item.confidence}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}