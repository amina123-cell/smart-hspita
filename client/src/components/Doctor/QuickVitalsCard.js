import React from 'react';
import { getVitalStatus } from '../../utils/vitalSignsLogic';

export default function QuickVitalsCard({ vitals, time }) {
  if (!vitals || !vitals.systolicBP) return <span className="no-data">لا توجد قياسات</span>;

  const bp = getVitalStatus('systolicBP', vitals.systolicBP);
  const hr = getVitalStatus('heartRate', vitals.heartRate);
  const temp = getVitalStatus('temperature', vitals.temperature);

  return (
    <div className="quick-vitals-row">
      <span className="vital-chip" style={{ background: bp.color }}>{vitals.systolicBP} BP</span>
      <span className="vital-chip" style={{ background: hr.color }}>{vitals.heartRate} HR</span>
      <span className="vital-chip" style={{ background: temp.color }}>{vitals.temperature}°C</span>
      <small className="time-badge">{time}</small>
    </div>
  );
}