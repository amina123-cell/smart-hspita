// ✅ منطق تقييم العلامات الحيوية وتلوينها وتحديد الخطورة
export const getVitalStatus = (type, value) => {
  if (!value && value !== 0) return { color: '#9ca3af', label: '-', status: 'empty' };
  const num = Number(value);

  switch (type) {
    case 'systolicBP': // ضغط الدم الانقباضي
      if (num < 90) return { color: '#ef4444', label: 'خطر', status: 'danger' };
      if (num <= 120) return { color: '#22c55e', label: 'طبيعي', status: 'normal' };
      if (num <= 140) return { color: '#f59e0b', label: 'تحذير', status: 'warning' };
      return { color: '#ef4444', label: 'خطر', status: 'danger' };

    case 'heartRate': // النبض
      if (num < 60 || num > 100) return { color: '#f59e0b', label: 'غير طبيعي', status: 'warning' };
      if (num > 120) return { color: '#ef4444', label: 'خطر', status: 'danger' };
      return { color: '#22c55e', label: 'طبيعي', status: 'normal' };

    case 'spO2': // التشبع
      if (num < 90) return { color: '#ef4444', label: 'حرج', status: 'danger' };
      if (num < 95) return { color: '#f59e0b', label: 'منخفض', status: 'warning' };
      return { color: '#22c55e', label: 'ممتاز', status: 'normal' };

    case 'temperature': // الحرارة
      if (num > 38.5) return { color: '#ef4444', label: 'حمى عالية', status: 'danger' };
      if (num > 37.5) return { color: '#f59e0b', label: 'حمى خفيفة', status: 'warning' };
      return { color: '#22c55e', label: 'طبيعي', status: 'normal' };

    default: return { color: '#9ca3af', label: '-', status: 'empty' };
  }
};

// ✅ حساب النتيجة التلقائية الشاملة (LEVEL_1, LEVEL_2...)
export const calculateAutoTriage = (vitals) => {
  let dangerCount = 0;
  let warningCount = 0;

  Object.entries(vitals).forEach(([key, val]) => {
    const status = getVitalStatus(key, val).status;
    if (status === 'danger') dangerCount++;
    if (status === 'warning') warningCount++;
  });

  if (dangerCount > 0) 
    return { level: 'LEVEL_1', color: '#ef4444', text: '🚨 حالة حرجة - تدخل فوري' };
  
  if (warningCount >= 2) 
    return { level: 'LEVEL_2', color: '#f59e0b', text: '⚠️ حالة غير مستقرة' };
  
  return { level: 'LEVEL_3', color: '#22c55e', text: '✅ حالة مستقرة' };
};