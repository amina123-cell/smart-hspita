import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VitalsChart({ historyData }) {
  // historyData = [{ time: '14:00', systolicBP: 120, heartRate: 75 }, ...]
  
  return (
    <div className="vitals-chart-container">
      <h4>📈 تطور المؤشرات (آخر 24 ساعة)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={historyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="systolicBP" stroke="#ef4444" name="الضغط" strokeWidth={2} />
          <Line type="monotone" dataKey="heartRate" stroke="#3b82f6" name="النبض" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}